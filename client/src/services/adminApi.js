/**
 * services/adminApi.js — admin dashboard, CRUD, analytics, AI assistant.
 */
import api from "./axios";

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  users: {
    list: (params) => api.get("/admin/users", { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
    update: (id, data) => api.put(`/admin/users/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  },
  inventory: {
    list: () => api.get("/admin/inventory").then((r) => r.data),
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
  ai: {
    chat: (message, conversationId) =>
      api.post("/admin/ai/chat", { message, conversationId }).then((r) => r.data),
  },
};

export default adminApi;