/**
 * server.js — Application entry point.
 * Responsibilities:
 *   - Load env + connect to Mongo
 *   - Register global middleware (security, parsing, rate limiting, logging)
 *   - Mount API routes under /api
 *   - Register centralized error handler
 *   - Start HTTP server with Socket.IO
 */
import http from "http";
import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/db.js";
import socketService from "./services/socketService.js";
import * as scheduler from "./jobs/scheduler.js";
import { warmCache } from "./services/embeddingCatalogService.js";

async function bootstrap() {
  await connectDB();

  // Warm the shared in-memory embedding cache. On a fresh load this does the
  // one-time full-catalog transfer now (before listeners accept traffic) instead
  // of making the first semantic-search / similar-books request block and time
  // out. Restarts reuse the on-disk snapshot in about a second.
  await warmCache();

  const server = http.createServer(app);
  socketService.init(server, env.CLIENT_URL);
  scheduler.start({ runOnStart: env.NODE_ENV !== "test" });

  server.listen(env.PORT, () => {
    console.log(`[server] running on :${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal) => {
    console.log(`[server] ${signal} received — shutting down`);
    scheduler.stop();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  server.on("error", (err) => {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("[server] fatal startup error:", err.message);
  if (err && err.name === "MongooseServerSelectionError") {
    console.error(
      "[server] hint: MongoDB Atlas could not be reached. Check MONGO_URI in .env, whitelist your current IP in Atlas, and verify your network."
    );
  }
  process.exit(1);
});
