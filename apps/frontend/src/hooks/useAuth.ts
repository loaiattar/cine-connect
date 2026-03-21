import { useCallback } from "react";
import { authService } from "@/service/auth.service";
import type { LoginCredentials, RegisterCredentials } from "@/service/auth.service";
import { useAuthStore, type AuthUser } from "@/stores/auth.store";

export type { AuthUser };
export type { LoginCredentials, RegisterCredentials } from "@/service/auth.service";

export interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (credentials: RegisterCredentials) => Promise<void>;
}

/**
 * Centralized auth state and actions. Uses the same store as route guards and the API client,
 * so token and user stay consistent across the app. Persists to localStorage via the store.
 */
export function useAuth(): UseAuthReturn {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const res = await authService.login(credentials);
      setAuth(res.token, res.refreshToken, { userId: res.userId, email: res.email });
    },
    [setAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const res = await authService.register(credentials);
      setAuth(res.token, res.refreshToken, { userId: res.userId, email: res.email });
    },
    [setAuth]
  );

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    register,
  };
}
