/**
 * services/semanticSearchService.js
 * Returns books ranked by cosine similarity to the query embedding.
 *
 * Performance: previously the full 384-dim embedding of every book was pulled
 * from the (remote) database on every request — a ~90s transfer for the whole
 * catalog, which made semantic search effectively unusable. Now the catalog is
 * loaded into a small in-memory cache once and refreshed on a TTL, so the
 * similarity scan runs entirely in memory (milliseconds) after the first load.
 */
import fs from "fs/promises";
import path from "path";
import Book from "../models/Book.js";
import { generateEmbedding } from "../ai/embeddings/embeddingService.js";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DISK_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours for the on-disk snapshot
const EMBEDDING_SELECT =
  "_id title slug authors categories coverImage price averageRating embedding";

const DISK_CACHE_PATH = path.resolve(process.cwd(), "data/embedding-cache.json");

let cachedBooks = [];
let cacheLoadedAt = 0;
let loadingPromise = null;

const readDiskCache = async () => {
  // Skip persistent cache under tests so mocks are exercised deterministically.
  if (process.env.NODE_ENV === "test") return null;
  try {
    const raw = await fs.readFile(DISK_CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    if (
      data &&
      Array.isArray(data.books) &&
      data.savedAt &&
      Date.now() - data.savedAt < DISK_CACHE_TTL_MS
    ) {
      return data.books;
    }
  } catch {
    // No cache yet — fall through to a DB load.
  }
  return null;
};

const writeDiskCache = async (books) => {
  if (process.env.NODE_ENV === "test") return;
  try {
    await fs.mkdir(path.dirname(DISK_CACHE_PATH), { recursive: true });
    await fs.writeFile(
      DISK_CACHE_PATH,
      JSON.stringify({ savedAt: Date.now(), books }),
      "utf8"
    );
  } catch (error) {
    console.warn("[semantic] failed to persist embed cache:", error.message);
  }
};

/**
 * Calculate cosine similarity between two vectors.
 */
const cosineSimilarity = (vectorA, vectorB) => {
  if (!vectorA || !vectorB) return 0;

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
 * Return the cached catalog, loading it from the in-memory cache, then the
 * on-disk snapshot, and finally from the database (persisting the result).
 * Multiple concurrent callers share a single in-flight load.
 */
const getCachedBooks = async () => {
  const now = Date.now();

  if (cachedBooks.length > 0 && now - cacheLoadedAt < CACHE_TTL_MS) {
    return cachedBooks;
  }

  if (cachedBooks.length === 0) {
    const diskBooks = await readDiskCache();

    if (diskBooks) {
      cachedBooks = diskBooks;
      cacheLoadedAt = Date.now();
    }
  }

  if (cachedBooks.length > 0 && now - cacheLoadedAt < CACHE_TTL_MS) {
    return cachedBooks;
  }

  if (!loadingPromise) {
    loadingPromise = loadCatalog()
      .then(async (books) => {
        cachedBooks = books;
        cacheLoadedAt = Date.now();
        await writeDiskCache(books);
        return books;
      })
      .finally(() => {
        loadingPromise = null;
      });
  }

  return loadingPromise;
};

/**
 * Perform semantic search.
 */
const semanticSearch = async ({
  query,
  limit = 10,
  category,
  minPrice,
  maxPrice,
}) => {
  if (!query || !query.trim()) {
    throw new Error("Search query is required.");
  }

  const queryEmbedding = await generateEmbedding(query);
  const books = await getCachedBooks();

  const results = [];

  for (const book of books) {
    if (category && !(book.categories || []).includes(String(category))) {
      continue;
    }

    const price = Number(book.price);
    if (minPrice !== undefined && price < Number(minPrice)) continue;
    if (maxPrice !== undefined && price > Number(maxPrice)) continue;

    results.push({
      ...book,
      similarity: cosineSimilarity(queryEmbedding, book.embedding),
    });
  }

  results.sort((a, b) => b.similarity - a.similarity);

  return results
    .slice(0, Number(limit))
    .map((book) => {
      const { embedding, ...bookWithoutEmbedding } = book;

      return {
        ...bookWithoutEmbedding,
        similarity: Number(
          book.similarity.toFixed(4)
        ),
      };
    });
};

const warmCache = async () => {
  try {
    await getCachedBooks();
  } catch (error) {
    console.error("[semantic] embed cache warm-up failed:", error.message);
  }
};

export {
  semanticSearch,
  cosineSimilarity,
  warmCache,
};
