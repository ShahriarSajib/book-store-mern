/**
 * services/userApi.js — current-user address book + order history.
 */
import api from "./axios";

export const userApi = {
  me: () => api.get("/users/me").then((r) => r.data),
  updateMe: (data) => api.put("/users/me", data).then((r) => r.data),
  getAddresses: () => api.get("/users/me/addresses").then((r) => r.data),
  addAddress: (data) => api.post("/users/me/addresses", data).then((r) => r.data),
  updateAddress: (id, data) => api.put(`/users/me/addresses/${id}`, data).then((r) => r.data),
  deleteAddress: (id) => api.delete(`/users/me/addresses/${id}`).then((r) => r.data),
  history: () => api.get("/users/me/history").then((r) => r.data),
};

export default userApi;
