/**
 * services/authApi.js — register/login/logout/refresh/profile.
 */
import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateProfile: (data) => api.put("/auth/me", data).then((r) => r.data),
  changePassword: (data) => api.put("/auth/me/password", data).then((r) => r.data),
  forgotPassword: (email) =>
    api.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (data) => api.post("/auth/reset-password", data).then((r) => r.data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`).then((r) => r.data),
};

export default authApi;