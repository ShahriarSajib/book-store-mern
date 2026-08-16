/**
 * controllers/recommendationController.js — combined recommendation endpoints.
 */
const catchAsync = require("../utils/catchAsync");
const trendingService = require("../services/trendingService");
const similarBookService = require("../services/similarBookService");
const personalizedRecommendationService = require("../services/personalizedRecommendationService");
const userService = require("../services/userService");

const trending = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const results = await trendingService.getTrendingBooks(limit);
  res.json({ results });
});

const similar = catchAsync(async (req, res) => {
  const results = await similarBookService.findSimilarBooks({
    bookId: req.params.bookId,
    ...req.query,
  });
  res.json(results);
});

const personalized = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const results = await personalizedRecommendationService.getPersonalizedRecommendations(req.user.id, limit);
  res.json({ results });
});

const recentlyViewed = catchAsync(async (req, res) => {
  const history = await userService.getHistory(req.user.id);
  res.json({ results: history.browseHistory });
});

module.exports = { trending, similar, personalized, recentlyViewed };
