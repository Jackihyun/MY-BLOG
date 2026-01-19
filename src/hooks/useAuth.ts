"use client";

import { useRecoilState } from "recoil";
import { authState } from "@/store/authState";
import { login as apiLogin, verifyToken } from "@/lib/api";
import { useCallback, useEffect } from "react";

export function useAuth() {
  const [auth, setAuth] = useRecoilState(authState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (auth.isHydrated) return;

    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setAuth({ ...parsed, isHydrated: true });
          return;
        } else {
          localStorage.removeItem("auth");
        }
      } catch {
        localStorage.removeItem("auth");
      }
    }
    setAuth((prev) => ({ ...prev, isHydrated: true }));
  }, [auth.isHydrated, setAuth]);

  const isAuthenticated = auth.isHydrated && auth.token !== null && auth.expiresAt !== null && Date.now() < auth.expiresAt;
  const token = isAuthenticated ? auth.token : null;

  const login = useCallback(
    async (password: string): Promise<boolean> => {
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
    [setAuth]
  );

  const logout = useCallback(() => {
    setAuth({
      token: null,
      isAuthenticated: false,
      expiresAt: null,
      isHydrated: true,
    });
    localStorage.removeItem("auth");
  }, [setAuth]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (!auth.token) return false;

    try {
      const result = await verifyToken(auth.token);
      return result.valid;
    } catch {
      logout();
      return false;
    }
  }, [auth.token, logout]);

  return {
    isAuthenticated,
    token,
    login,
    logout,
    checkAuth,
    isHydrated: auth.isHydrated,
  };
}
