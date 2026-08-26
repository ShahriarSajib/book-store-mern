/**
 * app.js — Express app composition
 */
import trendingRoutes from "./routes/trendingRoutes.js";
import userPreferenceRoutes from "./routes/userPreferenceRoutes.js";
import personalizedRecommendationRoutes from "./routes/personalizedRecommendationRoutes.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

import env from "./config/env.js";
import apiRouter from "./routes/index.js";
import semanticRoutes from "./routes/semanticRoutes.js";
import similarBookRoutes from "./routes/similarBookRoutes.js";
import * as paymentController from "./controllers/paymentController.js";

import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

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

export default app;
