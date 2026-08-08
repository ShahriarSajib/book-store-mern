/**
 * config/api.js — base URL + shared axios defaults.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default baseURL;