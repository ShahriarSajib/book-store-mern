/**
 * routes/orderRoutes.js — /api/orders/*
 *   POST /, GET /, GET /:id, PUT /:id/cancel, GET /:id/invoice
 */
import { Router } from "express";
import validate from "../middleware/validate.js";
import { protect, requireVerified } from "../middleware/auth.js";
import { orderValidators } from "../validators/index.js";
import * as ctrl from "../controllers/orderController.js";

const router = Router();

router.use(protect);

router.post("/", requireVerified, validate(orderValidators.createOrderValidators), ctrl.createOrder);
router.get("/", ctrl.listOrders);
router.get("/:id/tracking", ctrl.getTracking);
router.get("/:id/invoice", ctrl.downloadInvoice);
router.get("/:id", ctrl.getOrder);
router.put("/:id/cancel", requireVerified, ctrl.cancelOrder);
router.post("/:id/reorder", requireVerified, ctrl.reorder);

export default router;
