/**
 * scripts/setBookStock.js
 * Responsibility: restock the catalog with a healthy random stock level so the
 * low-stock notifier stops firing (and stops regenerating storage alerts).
 * Safe/idempotent — re-run any time.
 *
 * Usage:
 *   node scripts/setBookStock.js
 *   BOOK_STOCK_MIN=20 BOOK_STOCK_MAX=250 node scripts/setBookStock.js
 *   DRY_RUN=1 node scripts/setBookStock.js        # preview only
 */
import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set.");
  process.exit(1);
}

const MIN_STOCK = Number(process.env.BOOK_STOCK_MIN) || 10;
const MAX_STOCK = Number(process.env.BOOK_STOCK_MAX) || 150;
const BATCH_SIZE = 500;
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

function randomStock() {
  return Math.floor(MIN_STOCK + Math.random() * (MAX_STOCK - MIN_STOCK + 1));
}

async function run() {
  console.log("[stock] Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("[stock] Connected.\n");

  if (MIN_STOCK > MAX_STOCK) {
    console.error("[stock] BOOK_STOCK_MIN must be <= BOOK_STOCK_MAX.");
    await mongoose.disconnect();
    process.exit(1);
  }

  const db = mongoose.connection.db;
  const books = db.collection("books");

  const total = await books.countDocuments();
  const lowCount = await books.countDocuments({
    stock: { $gte: 0, $lte: LOW_STOCK_THRESHOLD },
  });
  const totalBytes = (await db.stats()).dataSize;

  console.log(`[stock] Books: ${total}  |  low stock (<=${LOW_STOCK_THRESHOLD}): ${lowCount}`);
  console.log(`[stock] Target stock: random ${MIN_STOCK}–${MAX_STOCK}`);

  if (process.env.DRY_RUN === "1") {
    console.log("[stock] Dry run — nothing changed.");
    await mongoose.disconnect();
    return;
  }

  const cursor = books.find({}, { projection: { _id: 1 } }).batchSize(BATCH_SIZE);
  let batchCount = 0;
  let updated = 0;

  while (true) {
    const docs = [];
    while (docs.length < BATCH_SIZE && cursor.hasNext()) {
      docs.push(await cursor.next());
    }
    if (docs.length === 0) break;

    const ops = docs.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { stock: randomStock() } },
      },
    }));

    const res = await books.bulkWrite(ops, { ordered: false });
    updated += res.modifiedCount;
    batchCount += docs.length;

    console.log(`[stock] ${batchCount}/${total} processed (updated: ${res.modifiedCount})`);
    if (docs.length < BATCH_SIZE) break;
  }

  const remainingLow = await books.countDocuments({
    stock: { $gte: 0, $lte: LOW_STOCK_THRESHOLD },
  });
  const afterTotalBytes = (await db.stats()).dataSize;

  console.log(`\n[stock] Done — ${updated} book(s) restocked.`);
  console.log(`[stock] Low-stock books now: ${remainingLow}`);
  console.log(`[stock] Data bytes: ${totalBytes} -> ${afterTotalBytes}`);

  await mongoose.disconnect();
  console.log("\n[stock] Disconnected.");
}

run().catch((err) => {
  console.error("[stock] Error:", err);
  process.exit(1);
});