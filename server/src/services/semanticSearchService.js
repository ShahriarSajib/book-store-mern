const Book = require("../models/Book");
const {
  generateEmbedding,
} = require("../ai/embeddings/embeddingService");

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

  const mongoFilter = {
    embedding: { $exists: true, $ne: [] },
  };

  if (category) {
    mongoFilter.categories = category;
  }

  if (minPrice !== undefined) {
    mongoFilter.price = {
      ...(mongoFilter.price || {}),
      $gte: Number(minPrice),
    };
  }

  if (maxPrice !== undefined) {
    mongoFilter.price = {
      ...(mongoFilter.price || {}),
      $lte: Number(maxPrice),
    };
  }

  const books = await Book.find(mongoFilter)
    .select("+embedding")
    .lean();

  const results = books.map((book) => {
    const similarity = cosineSimilarity(
      queryEmbedding,
      book.embedding
    );

    return {
      ...book,
      similarity,
    };
  });

  results.sort(
    (a, b) => b.similarity - a.similarity
  );

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

module.exports = {
  semanticSearch,
  cosineSimilarity,
};