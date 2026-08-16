/**
 * routes/recommendationRoutes.js — /api/recommendations/*
 *   GET /trending
 *   GET /personalized        (auth)
 *   GET /recently-viewed     (auth)
 *   GET /similar/:bookId
 */
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/recommendationController");

router.get("/trending", ctrl.trending);
router.get("/similar/:bookId", ctrl.similar);
router.get("/recently-viewed", protect, ctrl.recentlyViewed);
router.get("/personalized", protect, ctrl.personalized);

module.exports = router;
