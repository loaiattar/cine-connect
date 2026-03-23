import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Clapperboard, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export type AppNavVariant = "simple" | "standard" | "account";

export interface AppNavLayoutProps {
  children: ReactNode;
  /** simple: logo + home · standard: + notifications · account: + notifications + profile chip */
  variant?: AppNavVariant;
  /** chat: full-height flex column + sticky header shrink-0 */
  shell?: "default" | "chat";
}

/**
 * Shared sticky header (logo, optional notifications, optional profile, home) for app routes.
 */
export function AppNavLayout({
  children,
  variant = "simple",
  shell = "default",
}: AppNavLayoutProps) {
  const { user: authUser } = useAuth();
  const { user: profileUser, profile } = useProfile();
  const { unreadCount } = useNotifications({ limit: 100 });

  const showBell = variant === "standard" || variant === "account";
  const showProfile = variant === "account";

  const displayName = profileUser?.name ?? authUser?.email ?? "";
  const avatarUrl = profile?.avatarUrl ?? null;

  return (
    <div
      className={cn(
        "min-h-screen bg-black text-white",
        shell === "chat" && "flex flex-col"
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-zinc-800/50 bg-black/90 backdrop-blur-sm px-6 py-4",
          shell === "chat" && "shrink-0"
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-white transition-colors hover:text-zinc-300"
          >
            <Clapperboard className="h-6 w-6 text-red-500" />
            <span>
              <span className="text-red-500">Ciné</span>
              <span className="text-orange-400">Connect</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {showBell && (
              <Link
                to="/notifications"
                className="relative rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {showProfile && (
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full text-zinc-400 transition-colors hover:text-white"
                title="Mon profil"
                aria-label={displayName ? `Mon profil, ${displayName}` : "Mon profil"}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-sm font-medium text-white">
                    {displayName.slice(0, 1).toUpperCase() || "?"}
                  </span>
                )}
                <span className="text-sm">{displayName}</span>
              </Link>
            )}
            <Link
              to="/"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              ← Accueil
            </Link>
          </div>
        </div>
      </header>
      {shell === "chat" ? (
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
