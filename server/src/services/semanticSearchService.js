/**
 * services/semanticSearchService.js
 * Returns books ranked by cosine similarity to the query embedding.
 *
 * Performance: previously the full 384-dim embedding of every book was pulled
 * from the (remote) database on every request — a ~90s transfer for the whole
 * catalog, which made semantic search effectively unusable. The catalog is now
 * cached once in memory (see embeddingCatalogService) and the similarity scan
 * runs entirely in memory (milliseconds) after the first load. The same cache
 * also powers similar-book lookup, so only one catalog is held in memory.
 */
import { generateEmbedding } from "../ai/embeddings/embeddingService.js";
import {
  getCachedBooks,
  cosineSimilarity,
} from "./embeddingCatalogService.js";

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

export {
  semanticSearch,
  cosineSimilarity,
};