/**
 * jobs/rebuildEmbeddings.js
 * Responsibility: generate semantic embeddings for catalog books that are
 * missing one, or rebuild every embedding when `force` is true.
 * Safe to run inside a live server process (no process.exit).
 */
const Book = require("../models/Book");
const { generateEmbedding } = require("../ai/embeddings/embeddingService");
const logger = require("../utils/logger");

function buildEmbeddingText(book) {
  return [
    book.title,
    book.subtitle,
    Array.isArray(book.authors) ? book.authors.join(", ") : "",
    Array.isArray(book.categories) ? book.categories.join(", ") : "",
    book.publisher,
    Array.isArray(book.tags) ? book.tags.join(", ") : "",
    book.description,
  ]
    .filter(Boolean)
    .join(". ");
}

/**
 * @param {Object} [options]
 * @param {boolean} [options.force=false] re-embed books even if they already have a vector
 * @returns {Promise<{total:number, generated:number, skipped:number, failed:number}>}
 */
async function run({ force = false } = {}) {
  const filter = force
    ? { isActive: true }
    : {
        isActive: true,
        $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
      };

  const books = await Book.find(filter).select("+embedding");
  logger.info(`[job:rebuildEmbeddings] ${books.length} book(s) to embed`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const book of books) {
    try {
      if (!force && Array.isArray(book.embedding) && book.embedding.length > 0) {
        skipped++;
        continue;
      }

      const text = buildEmbeddingText(book);
      if (!text.trim()) {
        skipped++;
        continue;
      }

      book.embedding = await generateEmbedding(text);
      await book.save();
      generated++;
    } catch (err) {
      failed++;
      logger.warn(`[job:rebuildEmbeddings] failed for "${book.title}"`, { error: err.message });
    }
  }

  logger.info(
    `[job:rebuildEmbeddings] done — total=${books.length} generated=${generated} skipped=${skipped} failed=${failed}`
  );
  return { total: books.length, generated, skipped, failed };
}

module.exports = { run };
