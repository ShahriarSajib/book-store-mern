/**
 * middleware/errorHandler.js
 * Responsibility: centralized error handler. Maps AppError, Mongoose,
 * JWT, and validation errors to consistent JSON responses.
 */
import AppError from "../utils/AppError.js";

function isValidationError(err) {
  return err && (err.name === "ValidationError" || err.name === "CastError");
}

function normalizeError(err) {
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, code: err.code, message: err.message, details: err.details };
  }

  if (err && err.name === "ValidationError") {
    const details = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
    return { statusCode: 400, code: "VALIDATION_ERROR", message: "Invalid input data", details };
  }

  if (err && err.name === "CastError") {
    return { statusCode: 400, code: "INVALID_ID", message: `Invalid ${err.path}: ${err.value}` };
  }

  if (err && err.name === "JsonWebTokenError") {
    return { statusCode: 401, code: "INVALID_TOKEN", message: "Invalid or expired token" };
  }

  if (err && err.code === 11000) {
    return { statusCode: 409, code: "DUPLICATE_KEY", message: "Duplicate value for a unique field" };
  }

  return { statusCode: 500, code: "INTERNAL_ERROR", message: "Internal server error" };
}

function errorHandler(err, req, res, _next) {
  const { statusCode, code, message, details } = normalizeError(err);

  // eslint-disable-next-line no-console
  console.error(`[${req.method}] ${req.originalUrl} → ${statusCode} ${code}: ${message}`);
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    error: { code, message },
    ...(details ? { details } : {}),
  });
}

export default errorHandler;
