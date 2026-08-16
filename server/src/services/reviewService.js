/**
 * services/reviewService.js — add/update/delete review, recompute book rating.
 */
const AppError = require("../utils/AppError");
const { Review, Book } = require("../models");
const { getPagination, buildPageMeta } = require("../utils/paginate");

async function recomputeBookRating(bookId) {
  const [agg] = await Review.aggregate([
    { $match: { book: bookId, isApproved: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const averageRating = agg ? Math.round(agg.avg * 10) / 10 : 0;
  const reviewCount = agg ? agg.count : 0;
  await Book.updateOne({ _id: bookId }, { averageRating, reviewCount });
  return { averageRating, reviewCount };
}

async function listByBook(bookId, query = {}) {
  const { page, limit, skip } = getPagination(query);
  const filter = { book: bookId, isApproved: true };
  const [total, reviews] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name avatar"),
  ]);
  return { reviews, pagination: buildPageMeta(total, page, limit) };
}

async function create(userId, { book, rating, title, body }) {
  const existing = await Review.findOne({ book, user: userId });
  if (existing) {
    throw new AppError("You have already reviewed this book", 409, "REVIEW_EXISTS");
  }
  const review = await Review.create({
    book,
    user: userId,
    rating: Math.max(1, Math.min(5, Number(rating) || 0)),
    title,
    body,
  });
  await recomputeBookRating(book);
  return review.populate("user", "name avatar");
}

async function update(userId, reviewId, data) {
  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) throw new AppError("Review not found", 404, "NOT_FOUND");
  if (data.rating !== undefined) review.rating = Math.max(1, Math.min(5, Number(data.rating)));
  if (data.title !== undefined) review.title = data.title;
  if (data.body !== undefined) review.body = data.body;
  await review.save();
  await recomputeBookRating(review.book);
  return review.populate("user", "name avatar");
}

async function remove(userId, reviewId) {
  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) throw new AppError("Review not found", 404, "NOT_FOUND");
  const bookId = review.book;
  await review.deleteOne();
  await recomputeBookRating(bookId);
  return { success: true };
}

async function listAll(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.isApproved !== undefined) filter.isApproved = query.isApproved === "true";
  const [total, reviews] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("book", "title coverImage"),
  ]);
  return { reviews, pagination: buildPageMeta(total, page, limit) };
}

async function adminUpdate(reviewId, patch) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError("Review not found", 404, "NOT_FOUND");
  if (patch.isApproved !== undefined) review.isApproved = Boolean(patch.isApproved);
  if (patch.rating !== undefined) review.rating = Number(patch.rating);
  if (patch.body !== undefined) review.body = patch.body;
  await review.save();
  await recomputeBookRating(review.book);
  return review;
}

async function adminRemove(reviewId) {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) throw new AppError("Review not found", 404, "NOT_FOUND");
  await recomputeBookRating(review.book);
  return { success: true };
}

module.exports = {
  listByBook,
  create,
  update,
  remove,
  listAll,
  adminUpdate,
  adminRemove,
};
