/**
 * middleware/auth.js
 * Responsibility: verify JWT, attach req.user (id, role).
 */
const { verifyAccessToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const { User } = require("../models");

async function attachUser(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));
  }

  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub).select("name email role isActive");
  if (!user) {
    return next(new AppError("User account no longer exists", 401, "UNAUTHENTICATED"));
  }
  if (!user.isActive) {
    return next(new AppError("Your account has been disabled. Contact support.", 403, "ACCOUNT_DISABLED"));
  }

  req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
  return next();
}

function protect(req, res, next) {
  attachUser(req, res, next);
}

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme === "Bearer" && token) {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub).select("name email role isActive");
      if (user && user.isActive) {
        req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
      }
    }
  } catch (_err) {
    // ignore invalid tokens on optional routes
  }
  return next();
}

module.exports = { protect, optionalAuth };
