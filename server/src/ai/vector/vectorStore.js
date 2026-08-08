/**
 * ai/vector/vectorStore.js
 * Responsibility:
 *   Vector-store abstraction with a swappable backend.
 *   Used by embeddings (upsert), recommendations (query similar),
 *   RAG (query FAQ chunks).
 *
 * Interface:
 *   upsert(id, vector, metadata)
 *   query(vector, { topK, filter }): [{ id, score, metadata }]
 *   remove(id)
 *   removeByFilter(filter)
 *
 * This isolates Pinecone / Weaviate / Atlas Vector / in-memory so
 * your existing semantic recommendation system can drop in without
 * touching controllers or routes.
 */
// TODO: implement factory based on config/ai.js VECTOR_BACKEND
module.exports = {};