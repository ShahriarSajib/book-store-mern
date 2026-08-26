import { Router } from "express";

import {
  getRecommendations,
} from "../controllers/personalizedRecommendationController.js";

import { protect } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  protect,
  getRecommendations
);

export default router;
