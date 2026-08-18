/**
 * app.js — Express app composition
 */
const trendingRoutes =
  require("./routes/trendingRoutes");
const userPreferenceRoutes =
  require("./routes/userPreferenceRoutes");

const personalizedRecommendationRoutes =
  require("./routes/personalizedRecommendationRoutes");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const env = require("./config/env");
const apiRouter = require("./routes");
const semanticRoutes = require("./routes/semanticRoutes");
const similarBookRoutes = require("./routes/similarBookRoutes");
const paymentController = require("./controllers/paymentController");

const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Stripe webhook needs the RAW body for signature verification.
// This MUST come before express.json() so req.body is a Buffer.
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhook
);

app.use(express.json({ limit: "1mb" }));
app.use(compression());

app.use(express.static(path.resolve(process.cwd(), env.UPLOAD_DIR || "uploads")));

app.use(
  morgan(
    env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

app.use(
  "/api",
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  })
);

// Existing API routes
app.use("/api", apiRouter);

// Semantic Search API
app.use(
  "/api/semantic-search",
  semanticRoutes
);
app.use(
  "/api/similar-books",
  similarBookRoutes
);
app.use(
  "/api/recommendations/personalized",
  personalizedRecommendationRoutes
);
app.use(
  "/api/ai/recommendations/personalized",
  personalizedRecommendationRoutes
);
app.use(
  "/api/ai/recommendations/trending",
  trendingRoutes
);
app.use(
  "/api/users/preferences",
  userPreferenceRoutes
);
app.use(
  "/api/ai/preferences",
  userPreferenceRoutes
);

// Error handlers MUST remain last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
