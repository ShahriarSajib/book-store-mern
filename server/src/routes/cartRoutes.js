/**
 * routes/cartRoutes.js — /api/cart/*
 *   GET /, POST /, PUT /:bookId, DELETE /:bookId, DELETE / (clear)
 */
const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect, requireVerified } = require("../middleware/auth");
const { cartValidators } = require("../validators");
const ctrl = require("../controllers/cartController");

router.use(protect);

router.get("/", ctrl.getCart);
router.post("/", requireVerified, validate(cartValidators.addItemValidators), ctrl.addItem);
router.put("/:bookId", requireVerified, validate(cartValidators.updateQuantityValidators), ctrl.updateItem);
router.delete("/:bookId", requireVerified, ctrl.removeItem);
router.delete("/", requireVerified, ctrl.clearCart);

router.post("/coupon", requireVerified, ctrl.applyCoupon);
router.delete("/coupon", requireVerified, ctrl.removeCoupon);

module.exports = router;
