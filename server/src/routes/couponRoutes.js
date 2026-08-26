/**
 * routes/couponRoutes.js — /api/coupons/*
 *   POST /apply (cart-aware when called with cart payload)
 *   Admin: GET /, POST /, PUT /:id, DELETE /:id
 */
import { Router } from "express";
import validate from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { cartValidators, couponValidators } from "../validators/index.js";
import * as ctrl from "../controllers/couponController.js";

const router = Router();

router.post("/apply", validate(cartValidators.couponCodeValidators), ctrl.apply);

router.get("/", protect, requireAdmin, ctrl.list);
router.post("/", protect, requireAdmin, validate(couponValidators.createCouponValidators), ctrl.create);
router.put("/:id", protect, requireAdmin, ctrl.update);
router.delete("/:id", protect, requireAdmin, ctrl.remove);

export default router;
