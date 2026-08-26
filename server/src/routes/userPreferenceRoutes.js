import { Router } from "express";

import {
  getMyPreferences,
  addFavoriteGenre,
  addFavoriteAuthor,
} from "../controllers/userPreferenceController.js";

import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getMyPreferences);

router.post("/genre", protect, addFavoriteGenre);

router.post("/author", protect, addFavoriteAuthor);

export default router;
