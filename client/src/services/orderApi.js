/**
 * services/orderApi.js
 */
import api from "./axios";

export const orderApi = {
  place: (data) => api.post("/orders", data).then((r) => r.data),
  list: () => api.get("/orders").then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
  invoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: "blob" }).then((r) => r.data),
};

export default orderApi;