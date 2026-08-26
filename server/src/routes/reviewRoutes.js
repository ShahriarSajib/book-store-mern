/**
 * routes/reviewRoutes.js — /api/reviews/*
 *   GET /book/:bookId, POST /, PUT /:id, DELETE /:id
 */
import { Router } from "express";
import validate from "../middleware/validate.js";
import { protect, requireVerified } from "../middleware/auth.js";
import { reviewValidators } from "../validators/index.js";
import * as ctrl from "../controllers/reviewController.js";

const router = Router();

router.get("/book/:bookId", ctrl.listForBook);

router.use(protect);
router.post("/", requireVerified, validate(reviewValidators.createReviewValidators), ctrl.create);
router.put("/:id", requireVerified, validate(reviewValidators.updateReviewValidators), ctrl.update);
router.delete("/:id", requireVerified, ctrl.remove);

export default router;
