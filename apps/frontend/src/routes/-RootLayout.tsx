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
 * - Logged-out browsing: no shell — marketing home, public movie pages, community
 *   search, and user profiles stay full-width without the rail (drawer/bottom nav
 *   is deferred).
 */
const BARE_AUTH_PATHS = new Set(["/login", "/register"]);

export function RootLayout() {
  const { isAuthenticated } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (BARE_AUTH_PATHS.has(pathname)) {
    return <Outlet />;
  }

  if (isAuthenticated) {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  return <Outlet />;
}
