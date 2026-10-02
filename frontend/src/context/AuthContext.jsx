/**
 * Authentication context.
 * Holds the current user, resolves the session on mount (cookie-based JWT)
 * and exposes login/logout/register helpers to the rest of the app.
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";

import { authAPI } from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Resolve the existing session once on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await authAPI.getUser();
        setUser(data.user);
      } catch {
        // No valid session — stay unauthenticated
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    loadUser();
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
