/**
 * routes/couponRoutes.js — /api/coupons/*
 *   POST /apply (cart-aware when called with cart payload)
 *   Admin: GET /, POST /, PUT /:id, DELETE /:id
 */
const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { cartValidators, couponValidators } = require("../validators");
const ctrl = require("../controllers/couponController");

router.post("/apply", validate(cartValidators.couponCodeValidators), ctrl.apply);

router.get("/", protect, requireAdmin, ctrl.list);
router.post("/", protect, requireAdmin, validate(couponValidators.createCouponValidators), ctrl.create);
router.put("/:id", protect, requireAdmin, ctrl.update);
router.delete("/:id", protect, requireAdmin, ctrl.remove);

module.exports = router;
