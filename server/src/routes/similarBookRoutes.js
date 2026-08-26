/**
 * routes/similarBookRoutes.js
 */

import { Router } from "express";

import {
  getSimilarBooks,
} from "../controllers/similarBookController.js";

const router = Router();

// GET /api/similar-books/:bookId
router.get("/:bookId", getSimilarBooks);

export default router;
