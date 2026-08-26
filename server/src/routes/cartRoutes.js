/**
 * routes/cartRoutes.js — /api/cart/*
 *   GET /, POST /, PUT /:bookId, DELETE /:bookId, DELETE / (clear)
 */
import { Router } from "express";
import validate from "../middleware/validate.js";
import { protect, requireVerified } from "../middleware/auth.js";
import { restrictTo } from "../middleware/admin.js";
import { cartValidators } from "../validators/index.js";
import * as ctrl from "../controllers/cartController.js";

const router = Router();

router.use(protect, restrictTo("customer"));

router.get("/", ctrl.getCart);
router.post("/", requireVerified, validate(cartValidators.addItemValidators), ctrl.addItem);
router.put("/:bookId", requireVerified, validate(cartValidators.updateQuantityValidators), ctrl.updateItem);
router.delete("/:bookId", requireVerified, ctrl.removeItem);
router.delete("/", requireVerified, ctrl.clearCart);

router.post("/coupon", requireVerified, ctrl.applyCoupon);
router.delete("/coupon", requireVerified, ctrl.removeCoupon);

export default router;
