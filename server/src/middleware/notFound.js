/**
 * middleware/notFound.js
 * Responsibility: 404 handler for unknown routes.
 */
const AppError = require("../utils/AppError");

function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
}

module.exports = notFound;
