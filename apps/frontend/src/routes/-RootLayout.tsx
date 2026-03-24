import { Outlet } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";

/**
 * Layout policy (issue #306 / CinéConnectPlan §2):
 *
 * - `/login` and `/register`: no AppShell — full-page auth forms.
 * - Authenticated: AppShell + SidebarNav for all other routes (search, favorites,
 *   watchlist, profile, chat, notifications, community, home, movie detail, etc.).
 * - Logged-out browsing: no shell for marketing home, community search, and public
 *   profiles — except **movie detail** (`/movie/:id`), which uses AppShell for the
 *   glass hero + panels layout (issue #308).
 */
const BARE_AUTH_PATHS = new Set(["/login", "/register"]);

function shouldUseAppShell(pathname: string, isAuthenticated: boolean): boolean {
  if (BARE_AUTH_PATHS.has(pathname)) return false;
  if (isAuthenticated) return true;
  return pathname.startsWith("/movie/");
}

export function RootLayout() {
  const { isAuthenticated } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (shouldUseAppShell(pathname, isAuthenticated)) {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  return <Outlet />;
}
