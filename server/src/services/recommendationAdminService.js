/**
 * services/recommendationAdminService.js — admin recommendation management:
 * embedding status, recommendation logs, most recommended/clicked, regeneration.
 */
import { Book, RecommendationLog } from "../models/index.js";
import { getPagination, buildPageMeta } from "../utils/paginate.js";
import AppError from "../utils/AppError.js";

async function embeddingStatus(query = {}) {
  const { page, limit, skip } = getPagination(query);

  const filter = {};
  if (query.hasEmbedding === "true") {
    filter.embeddingId = { $exists: true, $ne: null };
  } else if (query.hasEmbedding === "false") {
    filter.$or = [{ embeddingId: { $exists: false } }, { embeddingId: null }, { embeddingId: "" }];
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
    ];
  }

  const [total, books] = await Promise.all([
    Book.countDocuments(filter),
    Book.find(filter)
      .select("title coverImage embeddingId averageRating purchaseCount stock isActive")
      .sort({ title: 1 })
      .skip(skip)
      .limit(limit),
  ]);

  const withEmbedding = await Book.countDocuments({
    embeddingId: { $exists: true, $ne: null },
  });

  return {
    books,
    summary: {
      total,
      withEmbedding,
      withoutEmbedding: total - withEmbedding,
    },
    pagination: buildPageMeta(total, page, limit),
  };
}

async function getMostRecommended(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const days = Math.max(1, Math.min(365, Number(query.days) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const pipeline = [
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: "$bookId",
        count: { $sum: 1 },
        avgScore: { $avg: "$score" },
        reasons: { $addToSet: "$reason" },
      },
    },
    { $sort: { count: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const [results, countResult] = await Promise.all([
    RecommendationLog.aggregate(pipeline),
    RecommendationLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$bookId" } },
      { $count: "total" },
    ]),
  ]);

  const total = countResult[0]?.total || 0;
  const bookIds = results.map((r) => r._id).filter(Boolean);
  const books = bookIds.length
    ? await Book.find({ _id: { $in: bookIds } }).select("title coverImage averageRating")
    : [];
  const bookMap = new Map(books.map((b) => [String(b._id), b]));

  const items = results.map((r) => ({
    book: bookMap.get(String(r._id)) || { _id: r._id, title: "Unknown" },
    count: r.count,
    avgScore: r.avgScore,
    reasons: r.reasons.filter(Boolean),
  }));

  return {
    items,
    days,
    pagination: buildPageMeta(total, page, limit),
  };
}

async function getMostClicked(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const days = Math.max(1, Math.min(365, Number(query.days) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const pipeline = [
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: "$bookId",
        uniqueUsers: { $addToSet: "$userId" },
        totalShows: { $sum: 1 },
        avgScore: { $avg: "$score" },
      },
    },
    {
      $project: {
        _id: 1,
        totalShows: 1,
        avgScore: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
    { $sort: { uniqueUsers: -1, totalShows: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const [results, countResult] = await Promise.all([
    RecommendationLog.aggregate(pipeline),
    RecommendationLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$bookId" } },
      { $count: "total" },
    ]),
  ]);

  const total = countResult[0]?.total || 0;
  const bookIds = results.map((r) => r._id).filter(Boolean);
  const books = bookIds.length
    ? await Book.find({ _id: { $in: bookIds } }).select("title coverImage averageRating purchaseCount")
    : [];
  const bookMap = new Map(books.map((b) => [String(b._id), b]));

  const items = results.map((r) => ({
    book: bookMap.get(String(r._id)) || { _id: r._id, title: "Unknown" },
    uniqueUsers: r.uniqueUsers,
    totalShows: r.totalShows,
    avgScore: r.avgScore,
  }));

  return {
    items,
    days,
    pagination: buildPageMeta(total, page, limit),
  };
}

async function listLogs(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.userId) filter.userId = query.userId;
  if (query.bookId) filter.bookId = query.bookId;
  if (query.reason) filter.reason = { $regex: query.reason, $options: "i" };
  if (query.days) {
    const since = new Date(Date.now() - Number(query.days) * 24 * 60 * 60 * 1000);
    filter.createdAt = { $gte: since };
  }

  const [total, logs] = await Promise.all([
    RecommendationLog.countDocuments(filter),
    RecommendationLog.find(filter)
      .populate("bookId", "title coverImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return { logs, pagination: buildPageMeta(total, page, limit) };
}

async function getSummary() {
  const [totalBooks, withEmbedding, totalLogs, uniqueUsers, recentLogs] =
    await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ embeddingId: { $exists: true, $ne: null } }),
      RecommendationLog.countDocuments(),
      RecommendationLog.distinct("userId").then((ids) => ids.length),
      RecommendationLog.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

  return {
    totalBooks,
    withEmbedding,
    withoutEmbedding: totalBooks - withEmbedding,
    totalLogs,
    uniqueUsers,
    recentLogs,
  };
}

async function regenerateEmbeddings(bookIds) {
  if (!bookIds || !bookIds.length) {
    throw new AppError("No book IDs provided", 400, "VALIDATION_ERROR");
  }

  const books = await Book.find({ _id: { $in: bookIds } });
  if (!books.length) {
    throw new AppError("No books found for the given IDs", 404, "NOT_FOUND");
  }

  // The AI embedding provider is currently a stub.
  // This marks books for regeneration when the provider is implemented.
  const results = books.map((book) => ({
    bookId: book._id,
    title: book.title,
    status: "queued",
    message: "Book marked for embedding regeneration. Embedding provider not yet configured.",
  }));

  return {
    requested: bookIds.length,
    processed: results.length,
    results,
  };
}

export default {
  embeddingStatus,
  getMostRecommended,
  getMostClicked,
  listLogs,
  getSummary,
  regenerateEmbeddings,
};
