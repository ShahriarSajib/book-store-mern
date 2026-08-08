/**
 * services/searchApi.js — keyword + semantic + autocomplete.
 */
import api from "./axios";

export const searchApi = {
  keyword: (params) => api.get("/search", { params }).then((r) => r.data),
  semantic: (params) => api.get("/search/semantic", { params }).then((r) => r.data),
  autocomplete: (q) => api.get("/search/autocomplete", { params: { q } }).then((r) => r.data),
};

export default searchApi;