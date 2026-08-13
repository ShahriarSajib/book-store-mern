/**
 * routes/authRoutes.js — /api/auth/*
 *   POST /register, /login, /logout, /refresh
 *   GET  /verify-email/:token, POST /resend-verification
 *   POST /forgot-password, /reset-password
 *   GET  /me, PUT /me, PUT /me/password
 */
const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const { authValidators } = require("../validators");
const ctrl = require("../controllers/authController");

router.post("/register", authLimiter, validate(authValidators.registerValidators), ctrl.register);
router.post("/login", authLimiter, validate(authValidators.loginValidators), ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);

router.get("/verify-email/:token", ctrl.verifyEmail);
router.post("/resend-verification", authLimiter, validate(authValidators.resendVerificationValidators), ctrl.resendVerification);

router.post("/forgot-password", authLimiter, validate(authValidators.forgotPasswordValidators), ctrl.forgotPassword);
router.post("/reset-password", authLimiter, validate(authValidators.resetPasswordValidators), ctrl.resetPassword);

router.get("/me", protect, ctrl.getMe);
router.put("/me", protect, validate(authValidators.updateProfileValidators), ctrl.updateMe);
router.put("/me/password", protect, validate(authValidators.changePasswordValidators), ctrl.changePassword);

module.exports = router;
