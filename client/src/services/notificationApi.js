/**
 * services/notificationApi.js — notification CRUD + preferences.
 */
import api from "./axios";

export const notificationApi = {
  list: (params) => api.get("/notifications", { params }).then((r) => r.data),
  markAsRead: (id) => api.post(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => api.post("/notifications/read-all").then((r) => r.data),
  remove: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
  clearAll: () => api.delete("/notifications").then((r) => r.data),
  getPreferences: () => api.get("/notifications/preferences").then((r) => r.data),
  updatePreferences: (preferences) => api.put("/notifications/preferences", preferences).then((r) => r.data),
};

export default notificationApi;
