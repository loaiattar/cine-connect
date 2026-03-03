import { create } from "zustand";
import { persist } from "zustand/middleware";
import { updateSocketAuth } from "@/lib/socket";

const AUTH_STORAGE_KEY = "cineconnect-auth";

export interface AuthUser {
  userId: number;
  email: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        set({ token, user });
        updateSocketAuth();
      },
      clearAuth: () => {
        set({ token: null, user: null });
        updateSocketAuth();
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: AUTH_STORAGE_KEY }
  )
);
