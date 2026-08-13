/**
 * middleware/rateLimit.js
 * Responsibility: per-route rate limiters (auth, chat, search).
 */
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." },
  },
});

module.exports = { authLimiter };
