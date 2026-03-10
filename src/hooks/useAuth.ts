"use client";

import { useRecoilState } from "recoil";
import { authState } from "@/store/authState";
import { login as apiLogin, verifyToken } from "@/lib/api";
import { useCallback, useEffect } from "react";

export function useAuth() {
  const [auth, setAuth] = useRecoilState(authState);
  const isAdminBypassEnabled =
    process.env.NEXT_PUBLIC_ADMIN_BYPASS === "true";

  const clearAuth = useCallback(() => {
    setAuth({
      token: null,
      isAuthenticated: false,
      expiresAt: null,
      isHydrated: true,
    });
    localStorage.removeItem("auth");
  }, [setAuth]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (auth.isHydrated) return;

    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        const isValidPayload =
          typeof parsed?.token === "string" &&
          parsed?.isAuthenticated === true &&
          typeof parsed?.expiresAt === "number";

        if (isValidPayload && Date.now() < parsed.expiresAt) {
          setAuth({ ...parsed, isHydrated: true });
          return;
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      }
    }
    setAuth((prev) => ({ ...prev, isHydrated: true }));
  }, [auth.isHydrated, setAuth, clearAuth]);

  const isAuthenticated = isAdminBypassEnabled ? true : auth.isAuthenticated;
  const token = isAdminBypassEnabled ? auth.token || "test-token" : auth.token;

  const login = useCallback(
    async (password: string): Promise<boolean> => {
      if (isAdminBypassEnabled) {
        const bypassAuth = {
          token: "test-token",
          isAuthenticated: true,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          isHydrated: true,
        };
        setAuth(bypassAuth);
        localStorage.setItem("auth", JSON.stringify(bypassAuth));
        return true;
      }

      try {
        const response = await apiLogin(password);
        const expiresAt = Date.now() + response.expiresIn;

        const newAuth = {
          token: response.token,
          isAuthenticated: true,
          expiresAt,
          isHydrated: true,
        };

        setAuth(newAuth);
        localStorage.setItem("auth", JSON.stringify(newAuth));

        return true;
      } catch {
        return false;
      }
    },
    [isAdminBypassEnabled, setAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (isAdminBypassEnabled) return true;
    if (!auth.token) return false;

    try {
      const result = await verifyToken(auth.token);
      return result.valid;
    } catch {
      logout();
      return false;
    }
  }, [auth.token, logout, isAdminBypassEnabled]);

  return {
    isAuthenticated,
    token,
    login,
    logout,
    checkAuth,
    isHydrated: auth.isHydrated,
  };
}
