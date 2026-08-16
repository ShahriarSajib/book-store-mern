/**
 * Generate embeddings for all books that do not have one.
 */

const connectDB = require("../../config/db");
const Book = require("../../models/Book");
const { generateEmbedding } = require("./embeddingService");

async function run() {
  try {
    // Connect using the project's existing DB configuration
    await connectDB();

    const books = await Book.find({});

    console.log(`[embeddings] Found ${books.length} books.`);

    if (books.length === 0) {
      console.log("[embeddings] No books found.");
      process.exit(0);
    }

    let generated = 0;
    let skipped = 0;
    let failed = 0;

    for (const book of books) {
      try {
        // Skip books that already have an embedding
        if (
          Array.isArray(book.embedding) &&
          book.embedding.length > 0
        ) {
          console.log(
            `[embeddings] Skipped: ${book.title}`
          );

          skipped++;
          continue;
        }

        // Build meaningful text for semantic representation
        const text = [
          book.title,
          book.description,
          book.author,
          book.category,
          book.publisher,
        ]
          .filter(Boolean)
          .join(". ");

        if (!text.trim()) {
          console.log(
            `[embeddings] No text available: ${book.title}`
          );

          skipped++;
          continue;
        }

        console.log(
          `[embeddings] Generating: ${book.title}`
        );

        const embedding = await generateEmbedding(text);

        book.embedding = embedding;

        await book.save();

        generated++;

        console.log(
          `[embeddings] Saved: ${book.title}`
        );
      } catch (error) {
        failed++;

        console.error(
          `[embeddings] Failed: ${book.title}`,
          error.message
        );
      }
    }

    console.log("\n========== EMBEDDING SUMMARY ==========");
    console.log(`Total books : ${books.length}`);
    console.log(`Generated   : ${generated}`);
    console.log(`Skipped     : ${skipped}`);
    console.log(`Failed      : ${failed}`);
    console.log("=======================================\n");

    process.exit(0);
  } catch (error) {
    console.error(
      "[embeddings] Fatal error:",
      error.message
    );

    process.exit(1);
  }
}

run();