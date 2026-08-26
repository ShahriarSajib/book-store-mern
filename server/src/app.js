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

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  env.CLIENT_URL,
  env.SERVER_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4173",
].filter(Boolean);

// Accept any localhost / 127.0.0.1 origin on any port during development.
// Production builds should set CLIENT_URL explicitly via env.
const isLocalDevOrigin = (origin) => {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    if (env.NODE_ENV === "production") return false;
    return (
      (u.hostname === "localhost" || u.hostname === "127.0.0.1") &&
      /^https?:$/.test(u.protocol)
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin / curl / server-to-server (no Origin header) is fine.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isLocalDevOrigin(origin)) return callback(null, true);
      // Reject — express will respond without CORS headers so the browser
      // surfaces a clear CORS error rather than a generic 500.
      return callback(null, false);
    },
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
