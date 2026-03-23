import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";

const LOGIN_PATH = "/login";

/**
 * Use in a route's beforeLoad. If there is no hydrated user in the store, redirects to login.
 * Ensure `main.tsx` awaited persist hydration (and optional cookie restore) before the router mounts.
 *
 * @example
 * export const Route = createFileRoute("/favorites")({
 *   beforeLoad: () => requireAuth(),
 *   component: FavoritesPage,
 * });
 */
export function requireAuth(): void {
  if (!useAuthStore.getState().user) {
    throw redirect({ to: LOGIN_PATH });
  }
}
