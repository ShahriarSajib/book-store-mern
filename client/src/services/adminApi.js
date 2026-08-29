/**
 * services/adminApi.js — admin dashboard, CRUD, analytics, AI assistant.
 */
import api from "./axios";

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  exportPdf: (type) =>
    api.get(`/admin/export/${type}`, { responseType: "blob" }).then((r) => r.data),
  users: {
    list: (params) => api.get("/admin/users", { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
    update: (id, data) => api.put(`/admin/users/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  },
  inventory: {
    list: (params) => api.get("/admin/inventory", { params }).then((r) => r.data),
    updateStock: (id, stock) =>
      api.put(`/admin/inventory/${id}`, { stock }).then((r) => r.data),
  },
  reviews: {
    list: (params) => api.get("/admin/reviews", { params }).then((r) => r.data),
    update: (id, data) => api.put(`/admin/reviews/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),
  },
  coupons: {
    list: () => api.get("/admin/coupons").then((r) => r.data),
    create: (data) => api.post("/admin/coupons", data).then((r) => r.data),
    update: (id, data) => api.put(`/admin/coupons/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data),
  },
  orders: {
    list: (params) => api.get("/admin/orders", { params }).then((r) => r.data),
    update: (id, data) => api.put(`/admin/orders/${id}`, data).then((r) => r.data),
  },
  analytics: {
    sales: (params) => api.get("/admin/analytics/sales", { params }).then((r) => r.data),
    inventory: () => api.get("/admin/analytics/inventory").then((r) => r.data),
    recommendations: () => api.get("/admin/analytics/recommendations").then((r) => r.data),
  },
  recommendations: {
    summary: () => api.get("/admin/recommendations/summary").then((r) => r.data),
    embeddings: (params) => api.get("/admin/recommendations/embeddings", { params }).then((r) => r.data),
    mostRecommended: (params) => api.get("/admin/recommendations/most-recommended", { params }).then((r) => r.data),
    mostClicked: (params) => api.get("/admin/recommendations/most-clicked", { params }).then((r) => r.data),
    logs: (params) => api.get("/admin/recommendations/logs", { params }).then((r) => r.data),
    regenerate: (bookIds) => api.post("/admin/recommendations/embeddings/regenerate", { bookIds }).then((r) => r.data),
  },
  ai: {
    chat: (message, conversationId) =>
      api.post("/admin/ai/chat", { message, conversationId }).then((r) => r.data),
    confirm: (confirmationToken) =>
      api.post("/admin/ai/confirm", { confirmationToken }).then((r) => r.data),
  },
};

export default adminApi;