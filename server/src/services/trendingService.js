/**
 * services/trendingService.js
 * Computes a "trending score" per book and returns the top-N.
 *
 * Performance: the score for ALL books (tens of thousands) can no longer be
 * computed by pulling every document into Node and reducing in JS — that made
 * the landing page take tens of seconds. Instead we push the scoring, sorting
 * and limiting down into MongoDB via an aggregation pipeline so only the top-N
 * rows are ever transferred. A short-lived in-memory cache then avoids
 * redoing the ~1s query on every page hit.
 */
import Book from "../models/Book.js";

const TRENDING_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_LIMIT = 50;

let cache = null;
let cacheLoadedAt = 0;
let loadingPromise = null;

/**
 * Mongo expression matching the JS default-value semantics:
 *   popularity.X || book.Y || 0
 * i.e. use popularity.X unless it is missing or 0, otherwise fall back to Y.
 */
const orFallback = (popularityPath, bookField) => ({
  $ifNull: [
    {
      $cond: [
        {
          $or: [
            { $eq: [{ $ifNull: [`$${popularityPath}`, null] }, null] },
            { $eq: [`$${popularityPath}`, 0] },
          ],
        },
        { $ifNull: [`$${bookField}`, 0] },
        `$${popularityPath}`,
      ],
    },
    0,
  ],
});

async function computeTrending(limit) {
  const results = await Book.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "popularityrecords",
        localField: "_id",
        foreignField: "bookId",
        as: "popularity",
      },
    },
    { $unwind: { path: "$popularity", preserveNullAndEmptyArrays: true } },

    /*
      Trending Score

      Purchase  = strong signal
      View      = medium signal
      Search    = medium signal
      Rating    = quality signal
      Activity  = freshness signal
    */
    {
      $addFields: {
        trendingScore: {
          $let: {
            vars: {
              views: orFallback("popularity.views", "viewCount"),
              purchases: orFallback("popularity.purchases", "purchaseCount"),
              searches: { $ifNull: ["$popularity.searches", 0] },
              rating: { $ifNull: ["$averageRating", 0] },
              activity: { $ifNull: ["$popularity.recentActivity", 0] },
            },
            in: {
              $round: [
                {
                  $add: [
                    { $multiply: ["$$purchases", 10] },
                    { $multiply: ["$$views", 1] },
                    { $multiply: ["$$searches", 3] },
                    { $multiply: ["$$rating", 5] },
                    { $multiply: ["$$activity", 5] },
                  ],
                },
                2,
              ],
            },
          },
        },
      },
    },
    { $sort: { trendingScore: -1 } },
    { $limit: limit },
  ]);

  return results.map(({ popularity, ...book }) => book);
}

async function getTrendingBooks(limit = 10) {
  const clamped = Math.min(Math.max(Number(limit) || 10, 1), MAX_LIMIT);
  const now = Date.now();

  // Serve from cache when it is still fresh.
  if (cache && now - cacheLoadedAt < TRENDING_CACHE_TTL_MS) {
    return cache.slice(0, clamped);
  }

  // Single-flight: concurrent calls share one recompute.
  if (!loadingPromise) {
    loadingPromise = computeTrending(MAX_LIMIT)
      .then((books) => {
        cache = books;
        cacheLoadedAt = Date.now();
        return books;
      })
      .finally(() => {
        loadingPromise = null;
      });
  }

  const books = await loadingPromise;
  return books.slice(0, clamped);
}

// Test helper: clear the in-memory cache between tests.
const resetTrendingCache = () => {
  cache = null;
  cacheLoadedAt = 0;
  loadingPromise = null;
};

export { getTrendingBooks, resetTrendingCache };

export default {
  getTrendingBooks,
};
