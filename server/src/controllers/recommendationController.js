/**
 * controllers/recommendationController.js — combined recommendation endpoints.
 */
import catchAsync from "../utils/catchAsync.js";
import trendingService from "../services/trendingService.js";
import * as similarBookService from "../services/similarBookService.js";
import * as personalizedRecommendationService from "../services/personalizedRecommendationService.js";
import userService from "../services/userService.js";

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

export { trending, similar, personalized, recentlyViewed };
