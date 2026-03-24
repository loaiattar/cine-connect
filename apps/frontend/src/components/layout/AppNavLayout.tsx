import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Clapperboard, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { glassHeaderClass, navLinkOutlineClass } from "@/lib/glass-ui";

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
        "min-h-dvh bg-app-base text-ink",
        shell === "chat" && "flex flex-col"
      )}
    >
      <header
        className={cn("px-6 py-4", glassHeaderClass, shell === "chat" && "shrink-0")}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink transition-colors hover:text-ink-secondary"
          >
            <Clapperboard className="h-6 w-6 text-accent-red" aria-hidden />
            <span>
              <span className="text-accent-red">Ciné</span>
              <span className="text-ink">Connect</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {showBell && (
              <Link
                to="/notifications"
                className="relative rounded-full p-2 text-ink-secondary transition-colors hover:bg-[var(--glass-bg-elevated)] hover:text-ink"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {showProfile && (
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full text-ink-secondary transition-colors hover:text-ink"
                title="Mon profil"
                aria-label={displayName ? `Mon profil, ${displayName}` : "Mon profil"}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-[var(--glass-border)]" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--glass-bg-elevated)] text-sm font-medium text-ink ring-1 ring-[var(--glass-border)]">
                    {displayName.slice(0, 1).toUpperCase() || "?"}
                  </span>
                )}
                <span className="hidden text-sm sm:inline">{displayName}</span>
              </Link>
            )}
            <Link to="/" className={navLinkOutlineClass}>
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
