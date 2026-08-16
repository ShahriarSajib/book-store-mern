/**
 * services/similarBookService.js
 *
 * Finds books that are semantically similar to a given book.
 */

const Book = require("../models/Book");

/**
 * Calculate cosine similarity between two vectors.
 *
 * Formula:
 * cosine(A, B) = (A . B) / (|A| * |B|)
 */
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return 0;
  }

  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const denominator =
    Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
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

  // Build filters.
  const filter = {
    _id: { $ne: sourceBook._id },
    isActive: true,
    embedding: { $exists: true, $ne: [] },
  };

  if (category) {
    filter.categories = category;
  }

  if (minPrice !== undefined && minPrice !== "") {
    filter.price = {
      ...(filter.price || {}),
      $gte: Number(minPrice),
    };
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    filter.price = {
      ...(filter.price || {}),
      $lte: Number(maxPrice),
    };
  }

  // Get candidate books.
  const candidateBooks = await Book.find(filter)
    .select(
      "+embedding title subtitle authors categories publisher " +
      "coverImage description price stock averageRating " +
      "ratingsCount reviewCount"
    )
    .lean();

  // Calculate similarity.
  const results = candidateBooks.map((book) => {
    const similarity = cosineSimilarity(
      sourceBook.embedding,
      book.embedding
    );

    // Do not return embedding to frontend.
    delete book.embedding;

    return {
      ...book,
      similarity: Number(similarity.toFixed(4)),
    };
  });

  // Highest similarity first.
  results.sort(
    (a, b) => b.similarity - a.similarity
  );

  return results.slice(0, safeLimit);
}

module.exports = {
  findSimilarBooks,
  cosineSimilarity,
};