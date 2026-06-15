"use client";

import { loginRequest } from "@/lib/auth/auth-api";
import { clearSession, persistSessionFromToken, restoreSessionFromStorage } from "@/lib/auth/session";
import { getAccessToken } from "@/lib/auth/token";
import type { AuthUser, LoginCredentials } from "@/lib/api/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  applySessionToken: (token: string) => Promise<AuthUser>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      let restoredUser = restoreSessionFromStorage();
      setUser(restoredUser);
      setIsAuthenticated(!!restoredUser);

      if (restoredUser && !restoredUser.fullName?.trim()) {
        const token = getAccessToken();
        if (token) {
          try {
            restoredUser = await persistSessionFromToken(token);
            setUser(restoredUser);
          } catch {
            // Giữ phiên từ token nếu không tải được my-info
          }
        }
      }

      setIsLoading(false);
    };

    void restore();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const authData = await loginRequest(credentials);
    if (!authData.token) {
      throw new Error("Không nhận được token từ máy chủ");
    }

    const authUser = await persistSessionFromToken(authData.token);
    setUser(authUser);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const applySessionToken = useCallback(async (token: string) => {
    const authUser = await persistSessionFromToken(token);
    setUser(authUser);
    setIsAuthenticated(true);
    return authUser;
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }

    try {
      const authUser = await persistSessionFromToken(token);
      setUser(authUser);
      setIsAuthenticated(true);
      return authUser;
    } catch {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      applySessionToken,
      refreshUser,
    }),
    [user, isAuthenticated, isLoading, login, logout, applySessionToken, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
