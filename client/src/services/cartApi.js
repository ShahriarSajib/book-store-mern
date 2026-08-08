/**
 * services/cartApi.js
 */
import api from "./axios";

export const cartApi = {
  get: () => api.get("/cart").then((r) => r.data),
  add: (bookId, quantity = 1) => api.post("/cart", { bookId, quantity }).then((r) => r.data),
  update: (bookId, quantity) => api.put(`/cart/${bookId}`, { quantity }).then((r) => r.data),
  remove: (bookId) => api.delete(`/cart/${bookId}`).then((r) => r.data),
  clear: () => api.delete("/cart").then((r) => r.data),
  applyCoupon: (code) => api.post("/coupons/apply", { code }).then((r) => r.data),
};

export default cartApi;