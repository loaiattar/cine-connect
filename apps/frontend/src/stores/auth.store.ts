import { create } from "zustand";
import { persist } from "zustand/middleware";
import { updateSocketAuth } from "@/lib/socket";

const AUTH_STORAGE_KEY = "cineconnect-auth";

export interface AuthUser {
  userId: number;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

/**
 * Session tokens live in httpOnly cookies (set by the API). We only persist non-sensitive
 * user fields for UX (e.g. show email in nav); cookies remain the source of truth for auth.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => {
        set({ user });
        updateSocketAuth();
      },
      clearAuth: () => {
        set({ user: null });
        updateSocketAuth();
      },
      isAuthenticated: () => !!get().user,
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ user: state.user }),
    }
  )
);
