/**
 * config/ai.js — AI subsystem configuration.
 * Centralizes providers, dimensions, and runtime toggles.
 * Lets us swap embedding/vector/LLM providers without code changes elsewhere.
 */
import env from "./env.js";

const aiConfig = {
  llm: {
    provider: env.LLM_PROVIDER,
    apiKey: env.LLM_API_KEY,
    model: env.LLM_MODEL,
    temperature: env.LLM_TEMPERATURE,
    maxTokens: env.LLM_MAX_TOKENS,
  },
  embedding: {
    provider: env.EMBEDDING_PROVIDER,
    model: env.EMBEDDING_MODEL,
    dim: env.EMBEDDING_DIM,
  },
  vector: {
    backend: env.VECTOR_BACKEND, // local | pinecone | weaviate | atlas
    indexName: env.VECTOR_INDEX,
  },
  rag: {
    topK: 4,
    minScore: 0.7,
  },
  tools: {
    // Tools the LLM is allowed to invoke. Enforced again by guardrails.
    read: [
      "searchBooks",
      "semanticSearchBooks",
      "getBookDetails",
      "getSimilarBooks",
      "getPersonalizedRecommendations",
      "getTrendingBooks",
      "getOrderStatus",
      "getOrderHistory",
      "getCart",
      "getWishlist",
      "searchFAQ",
    ],
    write: [
      "addToCart",
      "removeFromCart",
      "updateCart",
      "addToWishlist",
      "removeFromWishlist",
      "cancelOrder",
    ],
  },
};

export default aiConfig;
