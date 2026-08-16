/**
 * services/bookApi.js — book CRUD + public catalog endpoints.
 */
import api from "./axios";

export const bookApi = {
  list: (params) => api.get("/books", { params }).then((r) => r.data),
  get: (id) => api.get(`/books/${id}`).then((r) => r.data),
  create: (data) => api.post("/books", data).then((r) => r.data),
  update: (id, data) => api.put(`/books/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/books/${id}`).then((r) => r.data),
  reviews: (id) => api.get(`/reviews/book/${id}`).then((r) => r.data),
};

export default bookApi;