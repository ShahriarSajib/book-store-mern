/**
 * validators/reviewValidators.js — express-validator chains for review routes.
 */
import { body } from "express-validator";

const createReviewValidators = [
  body("book").isMongoId().withMessage("A valid book id is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1–5"),
  body("title").optional().trim().isLength({ max: 200 }),
  body("body").optional().trim().isLength({ max: 5000 }),
];

const updateReviewValidators = [
  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be 1–5"),
  body("title").optional().trim().isLength({ max: 200 }),
  body("body").optional().trim().isLength({ max: 5000 }),
];

export { createReviewValidators, updateReviewValidators };
