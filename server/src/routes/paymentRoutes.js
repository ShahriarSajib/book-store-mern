/**
 * routes/paymentRoutes.js — /api/payments/*
 *   POST /create-checkout-session  (authenticated)
 *   GET /config                     (public — returns publishable key)
 *
 * NOTE: POST /webhook is mounted directly in app.js BEFORE express.json()
 *       so it receives the raw body needed for Stripe signature verification.
 */
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import * as ctrl from "../controllers/paymentController.js";

const router = Router();

router.post("/create-checkout-session", protect, ctrl.createCheckoutSession);
router.get("/config", ctrl.getConfig);

export default router;
