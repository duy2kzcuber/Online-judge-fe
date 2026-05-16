"use client";

import { loginRequest } from "@/lib/auth/auth-api";
import { clearSession, persistSessionFromToken, restoreSessionFromStorage } from "@/lib/auth/session";
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
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoredUser = restoreSessionFromStorage();
    setUser(restoredUser);
    setIsAuthenticated(!!restoredUser);
    setIsLoading(false);
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

  const value = useMemo(
    () => ({ user, isAuthenticated, isLoading, login, logout }),
    [user, isAuthenticated, isLoading, login, logout],
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
