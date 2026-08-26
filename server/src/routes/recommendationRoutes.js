/**
 * routes/recommendationRoutes.js — /api/recommendations/*
 *   GET /trending
 *   GET /personalized        (auth)
 *   GET /recently-viewed     (auth)
 *   GET /similar/:bookId
 */
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import * as ctrl from "../controllers/recommendationController.js";

const router = Router();

router.get("/trending", ctrl.trending);
router.get("/similar/:bookId", ctrl.similar);
router.get("/recently-viewed", protect, ctrl.recentlyViewed);
router.get("/personalized", protect, ctrl.personalized);

export default router;
