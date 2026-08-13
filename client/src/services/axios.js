/**
 * services/axios.js — shared axios instance with auth interceptor.
 * On 401 it tries to refresh the access token once (single-flight),
 * retries the failed request, and otherwise clears the session.
 */
import axios from "axios";
import baseURL from "../config/api";

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const storage = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = storage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = storage.getRefresh();
  if (!refreshToken) throw new Error("no refresh token");
  // Use a plain axios call so the interceptor does not recurse.
  const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  storage.setTokens(data);
  return data.accessToken;
}

function handleUnauthorized(originalRequest) {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise.then((token) => {
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return api(originalRequest);
  });
}

const REFRESH_SKIP = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification",
];

function isRefreshSkipUrl(url = "") {
  return REFRESH_SKIP.some((p) => url.includes(p));
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;
    const alreadyRetried = config?._retried;

    if (response?.status === 401 && !alreadyRetried && !isRefreshSkipUrl(config?.url)) {
      config._retried = true;
      try {
        return await handleUnauthorized(config);
      } catch (_err) {
        storage.clear();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?next=${next}`;
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
