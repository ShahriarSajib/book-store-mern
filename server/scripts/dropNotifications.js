/**
 * scripts/dropNotifications.js
 * Drops all notifications to free ~78MB of storage.
 * Usage: node scripts/dropNotifications.js
 */
import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set.");
  process.exit(1);
}

async function run() {
  console.log("[drop] Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("[drop] Connected.\n");

  const db = mongoose.connection.db;

  const before = await db.collection("notifications").countDocuments();
  console.log(`[drop] Notifications before: ${before}`);

  await db.collection("notifications").drop();
  console.log("[drop] notifications collection dropped.");

  // Recreate indexes from the model
  await db.createCollection("notifications");
  await db.collection("notifications").createIndex({ user: 1, read: 1 });
  await db.collection("notifications").createIndex({ user: 1, createdAt: -1 });
  await db.collection("notifications").createIndex({ user: 1, type: 1, "data.bookId": 1 });
  await db.collection("notifications").createIndex({ createdAt: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });
  console.log("[drop] notifications collection recreated with indexes.");

  // Report sizes
  console.log("\n[collection sizes]:");
  for (const name of ["notifications", "books", "users", "authors", "categories"]) {
    try {
      const stats = await db.command({ collStats: name, scale: 1024 });
      console.log(`  ${name}: ${stats.count} docs, ${(stats.size / 1024).toFixed(2)} MB`);
    } catch (e) {
      console.log(`  ${name}: error`);
    }
  }

  await mongoose.disconnect();
  console.log("\n[drop] Done.");
}

run().catch((err) => {
  console.error("[drop] Error:", err);
  process.exit(1);
});
