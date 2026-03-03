import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";

const LOGIN_PATH = "/LoginPage";

/**
 * Use in a route's beforeLoad. If there is no stored token, redirects to login.
 * Throw the result so the router performs the redirect.
 *
 * @example
 * export const Route = createFileRoute("/favorites")({
 *   beforeLoad: () => requireAuth(),
 *   component: FavoritesPage,
 * });
 */
export function requireAuth(): void {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw redirect({ to: LOGIN_PATH });
  }
}
