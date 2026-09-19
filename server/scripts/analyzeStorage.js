/**
 * scripts/analyzeStorage.js
 * Read-only MongoDB storage diagnostic.
 * Reports per-collection data/storage/index sizes, per-index sizes, and the
 * largest documents by BSON size. DELETES NOTHING.
 *
 * Usage:
 *   node scripts/analyzeStorage.js
 *   TOP_N=5 node scripts/analyzeStorage.js   # largest-doc sample size
 */
import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set.");
  process.exit(1);
}

const TOP_N = Number(process.env.TOP_N) || 5;
const MB = 1024 * 1024;

function mb(bytes) {
  return `${(bytes / MB).toFixed(2)} MB`;
}

async function analyze() {
  console.log("[analyze] Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("[analyze] Connected.\n");

  const db = mongoose.connection.db;

  // ---- DB-level totals ----------------------------------------------------
  const dbStats = await db.stats();
  console.log("=== Database totals ===");
  console.log(`  dataSize:      ${mb(dbStats.dataSize)}`);
  console.log(`  storageSize:   ${mb(dbStats.storageSize)}`);
  console.log(`  indexSize:     ${mb(dbStats.indexSize)}`);
  console.log(`  totalSize:     ${mb(dbStats.totalSize)}`);
  console.log(`  collections:   ${dbStats.collections}`);
  console.log(`  avg object:    ${mb(dbStats.avgObjSize).replace(" MB", " B")}`);
  if (dbStats.fsFreeSize !== undefined) {
    console.log(`  Atlas fs free: ${mb(dbStats.fsFreeSize)}`);
  }
  console.log("");

  // ---- Per-collection sizes ----------------------------------------------
  const collections = (await db.listCollections().toArray()).filter(
    (c) => !c.name.startsWith("system.")
  );

  const rows = [];
  for (const { name } of collections) {
    try {
      const s = await db.command({ collStats: name, scale: 1 });
      rows.push({
        name,
        count: s.count || 0,
        dataBytes: s.size || 0,
        storageBytes: s.storageSize || 0,
        indexBytes: s.totalIndexSize || 0,
        avgBytes: s.avgObjSize || 0,
      });
    } catch {
      console.log(`  ${name}: stats unavailable`);
    }
  }

  rows.sort((a, b) => b.dataBytes - a.dataBytes);

  console.log("=== Collection sizes (sorted by data size) ===");
  console.log(
    `${"collection".padEnd(30)} ${"docs".padStart(9)} ${"data".padStart(10)} ${"storage".padStart(10)} ${"index".padStart(10)} ${"avg/doc".padStart(9)}`
  );
  for (const r of rows) {
    console.log(
      `${r.name.slice(0, 30).padEnd(30)} ${String(r.count).padStart(9)} ${mb(r.dataBytes).padStart(10)} ${mb(r.storageBytes).padStart(10)} ${mb(r.indexBytes).padStart(10)} ${r.avgBytes.toFixed(0).padStart(8)} B`
    );
  }
  console.log("");

  // ---- Index listing + sizes ---------------------------------------------
  console.log("=== Indexes per collection ===");
  for (const r of rows) {
    let indexSizes = {};
    try {
      const s = await db.command({ collStats: r.name, scale: 1 });
      indexSizes = s.indexSizes || {};
    } catch {
      continue;
    }
    let indexInfo = [];
    try {
      indexInfo = await db.collection(r.name).getIndexes();
    } catch {
      /* skip */
    }
    console.log(`\n[${r.name}] (${r.count} docs)`);
    for (const idx of indexInfo) {
      const size = indexSizes[idx.name];
      console.log(
        `  - ${idx.name}: ${JSON.stringify(idx.key)}` +
          (idx.expireAfterSeconds ? ` (TTL ${idx.expireAfterSeconds}s)` : "") +
          (size !== undefined ? ` => ${mb(size)}` : "")
      );
    }
  }
  console.log("");

  // ---- Largest documents ------------------------------------------------
  console.log(`=== Largest ${TOP_N} documents per collection ===`);
  // Only scan the biggest-looking collections to keep the analysis fast.
  for (const r of rows.slice(0, 8)) {
    if (r.count === 0) continue;
    const doubledFields = ["embedding", "description", "messages", "data"];
    try {
      const docs = await db
        .collection(r.name)
        .aggregate([
          {
            $project: {
              size: { $bsonSize: "$$ROOT" },
              _id: 1,
              title: 1,
              name: 1,
              excerpt: {
                $substrCP: [
                  { $ifNull: [{ $toString: "$title" }, { $toString: "$name" }, ""] },
                  0,
                  80,
                ],
              },
            },
          },
          { $sort: { size: -1 } },
          { $limit: TOP_N },
        ])
        .toArray();
      console.log(`\n[${r.name}]`);
      for (const d of docs) {
        console.log(
          `  ${mb(d.size).padStart(10)}  _id=${d._id}${d.excerpt ? `  "${d.excerpt}"` : ""}`
        );
      }
    } catch (e) {
      console.log(`\n[${r.name}] largest-doc scan skipped (${e.message.slice(0, 80)})`);
    }
  }

  await mongoose.disconnect();
  console.log("\n[analyze] Done. Nothing was deleted.");
}

analyze().catch((err) => {
  console.error("[analyze] Error:", err);
  process.exit(1);
});