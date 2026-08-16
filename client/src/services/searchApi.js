/**
 * services/searchApi.js — Section 1: AI Semantic Search.
 * Distinct from the recommendation endpoints; hits /semantic-search.
 */
import api from "./axios";

export const searchApi = {
  semantic: ({ q, limit = 12 } = {}) =>
    api.get(`/semantic-search`, { params: { q, limit } }).then((r) => r.data),
};

export default searchApi;