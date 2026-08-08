/**
 * ai/recommendation/embeddingIndex.js
 * Responsibility: build/rebuild book embeddings and upsert to vector store.
 * Called by admin import, book create/update, and a scheduled job.
 *
 * Pipeline:
 *   book -> buildText(book) -> embed -> vectorStore.upsert
 */
// TODO
module.exports = {};