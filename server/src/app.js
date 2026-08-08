/**
 * app.js — Express app composition (no listen()).
 * Responsibilities:
 *   - Build the Express app
 *   - Apply global middleware
 *   - Mount /api routes
 *   - Register 404 + error handlers
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const apiRouter = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  "/api",
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  })
);

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
