/**
 * context/AuthContext.jsx
 * Responsibility:
 *   Holds current user + tokens; exposes login/register/logout helpers.
 *   Source of truth for role-based UI gating.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import authApi from "../services/authApi";
import { storage } from "../services/axios";
import { ROLES } from "../config/constants";

const AuthContext = createContext(null);

function getErrorMessage(err) {
  return err?.response?.data?.error?.message || err?.message || "Something went wrong";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!storage.getAccess()) {
        setIsLoading(false);
        return;
      }
      try {
        const { user: me } = await authApi.me();
        if (!cancelled) setUser(me);
      } catch (_err) {
        storage.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    storage.setTokens(data);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_err) {
      // ignore network errors on logout
    }
    storage.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (payload) => {
    const { user: updated } = await authApi.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      role: user?.role || ROLES.GUEST,
      isAdmin: user?.role === ROLES.ADMIN,
      login,
      register,
      logout,
      updateUser,
      setUser,
      getErrorMessage,
    }),
    [user, isLoading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
