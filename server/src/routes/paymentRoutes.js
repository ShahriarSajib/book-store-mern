/**
 * routes/paymentRoutes.js — /api/payments/*
 *   POST /create-checkout-session  (authenticated)
 *   GET /config                     (public — returns publishable key)
 *
 * NOTE: POST /webhook is mounted directly in app.js BEFORE express.json()
 *       so it receives the raw body needed for Stripe signature verification.
 */
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/paymentController");

router.post("/create-checkout-session", protect, ctrl.createCheckoutSession);
router.get("/config", ctrl.getConfig);

module.exports = router;
