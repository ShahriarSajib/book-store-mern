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
  const server = app.listen(env.PORT, () => {
    console.log(`[server] running on :${env.PORT} (${env.NODE_ENV})`);
  });

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
