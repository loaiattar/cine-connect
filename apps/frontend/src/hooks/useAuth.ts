import { useCallback } from "react";
import { authService } from "@/service/auth.service";
import type { LoginCredentials, RegisterCredentials } from "@/service/auth.service";
import { useAuthStore, type AuthUser } from "@/stores/auth.store";

export type { AuthUser };
export type { LoginCredentials, RegisterCredentials } from "@/service/auth.service";

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
}

/**
 * Auth state and actions. JWTs stay in httpOnly cookies; the store holds only public user fields.
 */
export function useAuth(): UseAuthReturn {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const res = await authService.login(credentials);
      setUser({ userId: res.userId, email: res.email });
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    clearAuth();
  }, [clearAuth]);

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const res = await authService.register(credentials);
      setUser({ userId: res.userId, email: res.email });
    },
    [setUser]
  );

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };
}
