/**
 * services/recommendationApi.js
 */
import api from "./axios";

export const recommendationApi = {
  similar: (bookId) => api.get(`/recommendations/similar/${bookId}`).then((r) => r.data),
  personalized: () => api.get("/recommendations/personalized").then((r) => r.data),
  trending: () => api.get("/recommendations/trending").then((r) => r.data),
  recentlyViewed: () => api.get("/recommendations/recently-viewed").then((r) => r.data),
};

export default recommendationApi;