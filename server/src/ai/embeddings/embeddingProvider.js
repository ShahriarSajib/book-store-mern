/**
 * ai/embeddings/embeddingProvider.js
 * Responsibility:
 *   Unified interface to produce vector embeddings for text.
 *   Backed by an injected provider so the embedding model
 *   (sentence-transformers, OpenAI, Cohere, etc.) can be swapped
 *   without changing recommendation/RAG/chatbot code.
 *
 * Interface:
 *   async embed(text: string | string[]): Promise<number[][]>
 *   getDim(): number
 *
 * Pluggable providers live in ./providers/.
 */
// TODO: implement provider factory reading config/ai.js
module.exports = {};