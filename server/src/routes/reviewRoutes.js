/**
 * routes/reviewRoutes.js — /api/reviews/*
 *   GET /book/:bookId, POST /, PUT /:id, DELETE /:id
 */
const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect, requireVerified } = require("../middleware/auth");
const { reviewValidators } = require("../validators");
const ctrl = require("../controllers/reviewController");

router.get("/book/:bookId", ctrl.listForBook);

router.use(protect);
router.post("/", requireVerified, validate(reviewValidators.createReviewValidators), ctrl.create);
router.put("/:id", requireVerified, validate(reviewValidators.updateReviewValidators), ctrl.update);
router.delete("/:id", requireVerified, ctrl.remove);

module.exports = router;
