/**
 * services/wishlistApi.js
 */
import api from "./axios";

export const wishlistApi = {
  get: () => api.get("/users/me/wishlist").then((r) => r.data),
  add: (bookId) => api.post("/users/me/wishlist", { bookId }).then((r) => r.data),
  remove: (bookId) => api.delete(`/users/me/wishlist/${bookId}`).then((r) => r.data),
};

export default wishlistApi;