/**
 * services/similarBookService.js
 * Finds books that are semantically similar to a given book.
 *
 * Performance: candidates used to be pulled back from the (remote) database —
 * embedded vectors included — on every request, which made this endpoint take
 * seconds and frequently time out. Similar-book lookup now scans the shared
 * in-memory embedding catalog (see embeddingCatalogService), so requests are
 * served in milliseconds after the first load.
 *
 * Availability: while the embedding catalog is still loading (cold start) the
 * endpoint never makes the request wait on the database transfer. It serves a
 * fast, indexed same-category selection instead, and switches to the semantic
 * (cosine) ranking as soon as the catalog is warm.
 */
import Book from "../models/Book.js";
import {
  getCachedBooks,
  cosineSimilarity,
} from "./embeddingCatalogService.js";

const METADATA_SELECT =
  "title subtitle slug authors categories publisher coverImage description " +
  "price stock averageRating ratingsCount reviewCount isActive";

const priceBounds = (minPrice, maxPrice) => {
  const min =
    minPrice !== undefined && minPrice !== ""
      ? Number(minPrice)
      : null;
  const max =
    maxPrice !== undefined && maxPrice !== ""
      ? Number(maxPrice)
      : null;
  return { min, max };
};

/**
 * Fast fallback used only while the embedding catalog is unavailable (cold
 * start). Prefers active, same-category books — a small indexed query without
 * embeddings — so the section still renders something useful instead of
 * erroring or timing out.
 */
async function fallbackByCategory(
  sourceBook,
  { safeLimit, category, min, max }
) {
  const query = {
    _id: { $ne: sourceBook._id },
    isActive: true,
  };

  if (category) {
    query.categories = category;
  } else if (Array.isArray(sourceBook.categories) &&
    sourceBook.categories.length > 0) {
    query.categories = { $in: sourceBook.categories };
  }

  if (min !== null || max !== null) {
    query.price = {};
    if (min !== null) query.price.$gte = min;
    if (max !== null) query.price.$lte = max;
  }

  return Book.find(query)
    .select(METADATA_SELECT)
    .sort({ averageRating: -1, reviewCount: -1 })
    .limit(safeLimit)
    .lean();
}

/**
 * Find books similar to a given book.
 */
async function findSimilarBooks({
  bookId,
  limit = 10,
  category,
  minPrice,
  maxPrice,
}) {
  // Get source book.
  // embedding is select:false in Book.js,
  // so explicitly include it.
  const sourceBook = await Book.findById(bookId)
    .select("+embedding");

  if (!sourceBook) {
    const error = new Error("Book not found.");
    error.statusCode = 404;
    throw error;
  }

  if (
    !Array.isArray(sourceBook.embedding) ||
    sourceBook.embedding.length === 0
  ) {
    const error = new Error(
      "This book does not have an embedding."
    );

    error.statusCode = 400;
    throw error;
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    50
  );

  const { min, max } = priceBounds(minPrice, maxPrice);

  const catalog = await getCachedBooks();

  if (!catalog || catalog.length === 0) {
    // Catalog not ready yet — return fast category-based picks instead of
    // making the request wait on the (slow) database transfer.
    return fallbackByCategory(sourceBook, {
      safeLimit,
      category,
      min,
      max,
    });
  }

  const sourceId = String(sourceBook._id);
  const selectedCategory = category
    ? String(category)
    : null;

  // Calculate similarity in memory against the cached catalog.
  const results = [];

  for (const book of catalog) {
    if (String(book._id) === sourceId) {
      continue;
    }

    if (book.isActive === false) {
      continue;
    }

    if (
      !Array.isArray(book.embedding) ||
      book.embedding.length === 0
    ) {
      continue;
    }

    if (
      selectedCategory &&
      !(book.categories || []).includes(selectedCategory)
    ) {
      continue;
    }

    const price = Number(book.price);
    if (min !== null && price < min) {
      continue;
    }

    if (max !== null && price > max) {
      continue;
    }

    const similarity = cosineSimilarity(
      sourceBook.embedding,
      book.embedding
    );

    results.push({
      ...book,
      similarity: Number(similarity.toFixed(4)),
    });
  }

  // Highest similarity first.
  results.sort(
    (a, b) => b.similarity - a.similarity
  );

  // Do not return embedding to frontend;
  // copies are sliced so the shared cache is never mutated.
  return results
    .slice(0, safeLimit)
    .map((book) => {
      const { embedding, ...bookWithoutEmbedding } =
        book;

      return bookWithoutEmbedding;
    });
}

export {
  findSimilarBooks,
  cosineSimilarity,
};