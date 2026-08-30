/**
 * routes/paymentRoutes.js — /api/payments/*
 *   POST /create-checkout-session        (authenticated — Stripe)
 *   GET  /config                         (public — publishable key)
 *   POST /bkash/create                   (authenticated — bKash payment)
 *   GET  /bkash/callback                 (public  — bKash redirects here)
 *   POST /bkash/status                   (authenticated — verify + confirm)
 *   POST /bkash/execute                  (authenticated — ExecuteButton flow)
 *   POST /bkash/agreement                (authenticated — link bKash wallet)
 *   GET  /bkash/agreement                (authenticated — link status)
 *   DELETE /bkash/agreement              (authenticated — unlink wallet)
 *   GET  /bkash/agreement/callback       (public — bKash agreement redirect)
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

router.post("/bkash/create", protect, ctrl.createBkashPayment);
router.get("/bkash/callback", ctrl.bkashCallback);
router.post("/bkash/status", protect, ctrl.checkBkashStatus);
router.post("/bkash/execute", protect, ctrl.executeBkashPayment);
router.post("/bkash/agreement", protect, ctrl.createBkashAgreement);
router.get("/bkash/agreement", protect, ctrl.getBkashAgreement);
router.delete("/bkash/agreement", protect, ctrl.removeBkashAgreement);
router.get("/bkash/agreement/callback", ctrl.bkashAgreementCallback);

export default router;
