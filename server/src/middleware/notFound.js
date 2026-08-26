/**
 * middleware/notFound.js
 * Responsibility: 404 handler for unknown routes.
 */
import AppError from "../utils/AppError.js";

function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
}

export default notFound;
