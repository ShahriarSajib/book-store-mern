/**
 * services/axios.js — shared axios instance with auth interceptor.
 */
import axios from "axios";
import baseURL from "../config/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // TODO: 401 -> refresh / redirect to login
    return Promise.reject(err);
  }
);

export default api;