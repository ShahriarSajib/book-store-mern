/**
 * server.js — Application entry point.
 * Responsibilities:
 *   - Load env + connect to Mongo
 *   - Register global middleware (security, parsing, rate limiting, logging)
 *   - Mount API routes under /api
 *   - Register centralized error handler
 *   - Start HTTP server
 */
const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

async function bootstrap() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`[server] listening on :${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("[server] fatal startup error:", err);
  process.exit(1);
});
