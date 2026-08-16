/**
 * services/recommendationApi.js
 * Routes the four AI recommendation sections to the spec'd endpoints.
 * Each method hits a *distinct* URL so no two sections share an API.
 */
import api from "./axios";

export const recommendationApi = {
  /** Section 2 — "Books Similar to This" (per-book semantic similarity) */
  similar: (bookId, { limit = 8 } = {}) =>
    api.get(`/similar-books/${bookId}`, { params: { limit } }).then((r) => r.data),

  /** Section 3 — "Recommended For You" (auth required) */
  personalized: ({ limit = 8 } = {}) =>
    api
      .get(`/recommendations/personalized`, { params: { limit } })
      .then((r) => r.data),

  /** Section 4 — "Trending Books" (public, popularity score) */
  trending: ({ limit = 8 } = {}) =>
    api
      .get(`/ai/recommendations/trending`, { params: { limit } })
      .then((r) => r.data),

  /** Section 5 — Recently viewed (kept on the same service for cohesion) */
  recentlyViewed: ({ limit = 8 } = {}) =>
    api
      .get(`/recommendations/recently-viewed`, { params: { limit } })
      .then((r) => r.data),
};

export default recommendationApi;