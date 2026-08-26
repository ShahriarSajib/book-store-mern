/**
 * services/searchApi.js — AI Semantic Search.
 * Hits /semantic-search with query + optional filters.
 */
import api from "./axios";

export const searchApi = {
  semantic: ({ q, limit = 20, category, minPrice, maxPrice } = {}) => {
    const params = { q, limit };
    if (category) params.category = category;
    if (minPrice !== undefined && minPrice !== "") params.minPrice = minPrice;
    if (maxPrice !== undefined && maxPrice !== "") params.maxPrice = maxPrice;
    return api.get("/semantic-search", { params, timeout: 60000 }).then((r) => r.data);
  },
};

export default searchApi;
