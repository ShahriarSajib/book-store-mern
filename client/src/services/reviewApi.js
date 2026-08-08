/**
 * services/reviewApi.js
 */
import api from "./axios";

export const reviewApi = {
  forBook: (bookId) => api.get(`/reviews/book/${bookId}`).then((r) => r.data),
  create: (data) => api.post("/reviews", data).then((r) => r.data),
  update: (id, data) => api.put(`/reviews/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
};

export default reviewApi;