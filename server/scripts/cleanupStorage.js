/**
 * scripts/cleanupStorage.js
 * Batched cleanup to free MongoDB Atlas storage.
 * Usage: node scripts/cleanupStorage.js
 */
import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set.");
  process.exit(1);
}

const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const BATCH_SIZE = 1000;

async function deleteBatched(collection, filter, label) {
  let totalDeleted = 0;
  while (true) {
    const ids = await collection
      .find(filter, { projection: { _id: 1 } })
      .limit(BATCH_SIZE)
      .toArray();

    if (ids.length === 0) break;

    // Delete by _id only (filter already applied in the find)
    const result = await collection.deleteMany({
      _id: { $in: ids.map((d) => d._id) },
    });
    totalDeleted += result.deletedCount;
    if (totalDeleted % 5000 === 0 || ids.length < BATCH_SIZE) {
      console.log(`  ${label}: deleted ${result.deletedCount} (total: ${totalDeleted})`);
    }

    if (ids.length < BATCH_SIZE) break;
  }
  return totalDeleted;
}

async function cleanup() {
  console.log("[cleanup] Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("[cleanup] Connected.\n");

  const db = mongoose.connection.db;

  // 1. Delete old notifications (the biggest offender)
  console.log("[cleanup] Deleting old notifications (>7 days)...");
  const notifCount = await deleteBatched(
    db.collection("notifications"),
    { createdAt: { $lt: SEVEN_DAYS_AGO } },
    "notifications"
  );
  console.log(`[notifications] Total deleted: ${notifCount}\n`);

  // 2. Report collection sizes
  console.log("[cleanup] Collection stats:");
  const collections = await db.listCollections().toArray();
  for (const { name } of collections) {
    try {
      const stats = await db.command({ collStats: name, scale: 1024 });
      const sizeKB = stats.size || 0;
      const sizeMB = (sizeKB / 1024).toFixed(2);
      const count = stats.count || 0;
      console.log(`  ${name}: ${count} docs, ${sizeMB} MB`);
    } catch (e) {
      console.log(`  ${name}: stats error`);
    }
  }

  await mongoose.disconnect();
  console.log("\n[cleanup] Done.");
}

cleanup().catch((err) => {
  console.error("[cleanup] Error:", err);
  process.exit(1);
});
