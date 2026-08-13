/**
 * middleware/admin.js
 * Responsibility: gate routes to admin role only.
 */
const AppError = require("../utils/AppError");

function restrictTo(...roles) {
  return function requireRole(req, _res, next) {
    if (!req.user) {
      return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403, "FORBIDDEN"));
    }
    return next();
  };
}

const requireAdmin = restrictTo("admin");

module.exports = { restrictTo, requireAdmin };
