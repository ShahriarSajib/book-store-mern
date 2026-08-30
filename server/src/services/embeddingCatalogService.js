/**
 * services/embeddingCatalogService.js
 * Shared in-memory embedding catalog powering semantic search and similar-book
 * lookup.
 *
 * Performance: previously the full 384-dim embedding of every book was pulled
 * from the (remote) database on every request — a ~90s transfer for the whole
 * catalog, which made semantic search and similar-book lookup time out
 * (clients abort after 15s). The catalog is loaded once and kept in memory for
 * a TTL, and a disk snapshot lets restarts reuse the previous load in ~5s.
 *
 * Availability: a REQUEST never blocks on a database reload.
 *   - fresh in-memory catalog                 → serve immediately
 *   - stale in-memory catalog                 → serve immediately, refresh in bg
 *   - empty memory + disk snapshot            → serve the snapshot, upgrade in bg
 *   - empty memory + no snapshot (cold start) → return [] now, start bg load
 * The boot-time warm-up awaits the first load once, so requests always find a
 * warm catalog; during the rare cold window consumers degrade gracefully
 * (similar-book lookup falls back to a fast category query).
 */
import fs from "fs/promises";
import path from "path";
import Book from "../models/Book.js";
import logger from "../utils/logger.js";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DISK_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours for the on-disk snapshot
const CACHE_VERSION = 2; // marks a snapshot written with the current EMBEDDING_SELECT

const EMBEDDING_SELECT =
  "_id title subtitle slug authors categories publisher coverImage description " +
  "price stock averageRating ratingsCount reviewCount isActive embedding";

// Try the data dir relative to the working directory first (the usual
// `npm run dev` inside server/), then a repo-root invocation.
const DISK_CACHE_CANDIDATES = [
  path.resolve(process.cwd(), "data/embedding-cache.json"),
  path.resolve(process.cwd(), "server/data/embedding-cache.json"),
];

let cachedBooks = [];
let cacheLoadedAt = 0;
let cacheComplete = false; // true when the in-memory catalog has the full field select
let loadingPromise = null;
// Path that actually holds a readable snapshot; writes reuse it so we never
// create duplicate copies across start directories.
let activeDiskPath = DISK_CACHE_CANDIDATES[0];

const hasValidEmbedding = (book) =>
  Array.isArray(book.embedding) && book.embedding.length > 0;

const readDiskCache = async () => {
  // Skip persistent cache under tests so mocks are exercised deterministically.
  if (process.env.NODE_ENV === "test") return null;
  for (const candidate of DISK_CACHE_CANDIDATES) {
    try {
      const raw = await fs.readFile(candidate, "utf8");
      const data = JSON.parse(raw);
      if (
        !data ||
        !Array.isArray(data.books) ||
        data.books.length === 0 ||
        !data.books.every(hasValidEmbedding)
      ) {
        continue;
      }
      // A snapshot written by an older schema version (or missing a version
      // field) is still usable immediately — it only lacks some display fields,
      // which the background refresh fills in.
      activeDiskPath = candidate;
      return {
        books: data.books,
        complete:
          data.version === CACHE_VERSION &&
          typeof data.savedAt === "number" &&
          Date.now() - data.savedAt < DISK_CACHE_TTL_MS,
      };
    } catch {
      // Try the next candidate.
    }
  }
  return null;
};

const writeDiskCache = async (books) => {
  if (process.env.NODE_ENV === "test") return;
  try {
    await fs.mkdir(path.dirname(activeDiskPath), { recursive: true });
    await fs.writeFile(
      activeDiskPath,
      JSON.stringify({ savedAt: Date.now(), version: CACHE_VERSION, books }),
      "utf8"
    );
  } catch (error) {
    logger.warn("[embedding-catalog] failed to persist cache:", error.message);
  }
};

/**
 * Calculate cosine similarity between two vectors.
 */
const cosineSimilarity = (vectorA, vectorB) => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) return 0;

  if (vectorA.length !== vectorB.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];

    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
};

const loadCatalog = async () =>
  Book.find({ embedding: { $exists: true, $ne: [] } })
    .select(EMBEDDING_SELECT)
    .lean();

/**
 * Start a single-flight catalog reload in the background. Callers still holding
 * the previous catalog (if any) keep serving from it until this completes.
 */
const refreshInBackground = () => {
  if (!loadingPromise) {
    logger.info("[embedding-catalog] loading catalog from database...");
    loadingPromise = loadCatalog()
      .then(async (books) => {
        cachedBooks = books;
        cacheLoadedAt = Date.now();
        cacheComplete = true;
        logger.info(
          `[embedding-catalog] catalog ready: ${books.length} book(s) with embeddings`
        );
        await writeDiskCache(books);
        return books;
      })
      .catch((error) => {
        logger.warn("[embedding-catalog] load failed:", error.message);
        return null;
      })
      .finally(() => {
        loadingPromise = null;
      });
  }
  return loadingPromise;
};

/**
 * Return the cached catalog without EVER blocking a request on a database
 * reload:
 *   1. fresh in-memory catalog → served as-is
 *   2. stale in-memory catalog → served as-is, refreshed in the background
 *   3. empty memory + disk snapshot → serve the snapshot, upgrade in background
 *   4. empty memory + no snapshot → start the load, return [] (consumers
 *      degrade gracefully until the boot-time warm-up lands)
 */
const getCachedBooks = async () => {
  const now = Date.now();

  if (cachedBooks.length > 0 && now - cacheLoadedAt < CACHE_TTL_MS) {
    return cachedBooks;
  }

  if (cachedBooks.length > 0) {
    refreshInBackground();
    return cachedBooks;
  }

  const diskCache = await readDiskCache();

  if (diskCache) {
    cachedBooks = diskCache.books;
    cacheLoadedAt = Date.now();
    cacheComplete = diskCache.complete;

    if (!cacheComplete) {
      refreshInBackground();
    }

    return cachedBooks;
  }

  refreshInBackground();
  return cachedBooks;
};

/**
 * Boot-time warm-up. With a disk snapshot this takes ~5s and returns quickly,
 * deferring the field upgrade to the background. On a truly cold deploy it
 * takes the one-time database transfer NOW (before listeners accept traffic),
 * so requests are never the ones waiting on it.
 */
const warmCache = async () => {
  try {
    const books = await getCachedBooks();
    if (!books || books.length === 0) {
      await refreshInBackground();
    }
  } catch (error) {
    logger.warn("[embedding-catalog] embed cache warm-up failed:", error.message);
  }
};

/**
 * Drop the cached catalog. Intended for tests to keep cases isolated.
 */
const clearCache = () => {
  cachedBooks = [];
  cacheLoadedAt = 0;
  cacheComplete = false;
  loadingPromise = null;
};

export {
  getCachedBooks,
  warmCache,
  clearCache,
  cosineSimilarity,
};