import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bookmark,
  Clapperboard,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { focusVisibleRingInsetClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";

export type NavItemConfig = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** When true, only exact `to` matches (e.g. home). */
  end?: boolean;
  /** Custom active check (e.g. profile subtree). */
  isActive?: (pathname: string) => boolean;
};

const MAIN_NAV: NavItemConfig[] = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/search", label: "Recherche", icon: Search, end: true },
  { to: "/favorites", label: "Favoris", icon: Heart, end: true },
  { to: "/watchlist", label: "À voir", icon: Bookmark, end: true },
  {
    to: "/profile",
    label: "Profil",
    icon: User,
    end: true,
    isActive: (p) => p === "/profile" || p.startsWith("/profile/"),
  },
  { to: "/chat", label: "Chat", icon: MessageCircle, end: true },
  { to: "/notifications", label: "Notifications", icon: Bell, end: true },
  { to: "/community", label: "Communauté", icon: Users, end: true },
];

function navItemActive(pathname: string, item: NavItemConfig): boolean {
  if (item.isActive) return item.isActive(pathname);
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function NavItem({
  item,
  pathname,
  badge,
}: {
  item: NavItemConfig;
  pathname: string;
  badge?: number;
}) {
  const active = navItemActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl py-2.5 pl-2 pr-2 transition-colors md:pl-3",
        focusVisibleRingInsetClass,
        active
          ? "bg-accent-red/20 text-accent-red"
          : "text-ink-secondary hover:bg-[var(--glass-bg-elevated)] hover:text-ink"
      )}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
        {badge != null && badge > 0 ? (
          <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "min-w-0 truncate text-sm font-medium transition-[max-width,opacity] duration-300 ease-out",
          "max-w-0 overflow-hidden opacity-0",
          "md:group-hover/sidebar:max-w-[11rem] md:group-hover/sidebar:opacity-100",
          "md:group-focus-within/sidebar:max-w-[11rem] md:group-focus-within/sidebar:opacity-100"
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

/**
 * Collapsed icon rail; expands on hover / focus-within (md+) per CinéConnectPlan §2.
 * Mobile: fixed narrow rail only (expand deferred to drawer / bottom nav).
 */
export function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout } = useAuth();
  const { user: profileUser, profile } = useProfile();
  const { unreadCount } = useNotifications({ limit: 100 });

  const displayName = profileUser?.name ?? profileUser?.email ?? "Profil";
  const avatarUrl = profile?.avatarUrl ?? null;

  return (
    <aside
      className={cn(
        "group/sidebar flex h-dvh w-14 shrink-0 flex-col overflow-x-hidden border-r border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]",
        "transition-[width] duration-300 ease-out",
        "md:hover:w-56 md:focus-within:w-56"
      )}
      aria-label="Navigation principale"
    >
      <div className="flex shrink-0 flex-col gap-1 border-b border-[var(--glass-border)] p-2">
        <Link
          to="/"
          title="CinéConnect"
          aria-label="CinéConnect — accueil"
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-xl py-2.5 pl-2 pr-2 transition-colors md:pl-3",
            focusVisibleRingInsetClass
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Clapperboard className="h-6 w-6 text-accent-red" aria-hidden />
          </span>
          <span
            className={cn(
              "truncate text-sm font-extrabold tracking-tight transition-[max-width,opacity] duration-300 ease-out",
              "max-w-0 overflow-hidden opacity-0",
              "md:group-hover/sidebar:max-w-[11rem] md:group-hover/sidebar:opacity-100",
              "md:group-focus-within/sidebar:max-w-[11rem] md:group-focus-within/sidebar:opacity-100"
            )}
          >
            <span className="text-accent-red">Ciné</span>
            <span className="text-ink">Connect</span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 p-2">
        {MAIN_NAV.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            pathname={pathname}
            badge={item.to === "/notifications" ? unreadCount : undefined}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--glass-border)] p-2">
        <Link
          to="/profile"
          title="Paramètres"
          aria-label="Paramètres du compte"
          aria-current={pathname === "/profile" ? "page" : undefined}
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-xl py-2.5 pl-2 pr-2 text-ink-secondary transition-colors hover:bg-[var(--glass-bg-elevated)] hover:text-ink md:pl-3",
            focusVisibleRingInsetClass,
            pathname === "/profile" && "bg-accent-red/20 text-accent-red"
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Settings className="h-5 w-5" aria-hidden />
          </span>
          <span
            className={cn(
              "min-w-0 truncate text-sm font-medium transition-[max-width,opacity] duration-300 ease-out",
              "max-w-0 overflow-hidden opacity-0",
              "md:group-hover/sidebar:max-w-[11rem] md:group-hover/sidebar:opacity-100",
              "md:group-focus-within/sidebar:max-w-[11rem] md:group-focus-within/sidebar:opacity-100"
            )}
          >
            Paramètres
          </span>
        </Link>

        <Link
          to="/profile"
          title={displayName}
          aria-label={`Mon profil — ${displayName}`}
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-xl py-2 pl-2 pr-2 transition-colors hover:bg-[var(--glass-bg-elevated)] md:pl-3",
            focusVisibleRingInsetClass
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-[var(--glass-border)]"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--glass-bg-elevated)] text-sm font-medium text-ink ring-1 ring-[var(--glass-border)]">
              {displayName.slice(0, 1).toUpperCase() || "?"}
            </span>
          )}
          <span
            className={cn(
              "min-w-0 truncate text-sm font-medium text-ink-secondary transition-[max-width,opacity] duration-300 ease-out",
              "max-w-0 overflow-hidden opacity-0",
              "md:group-hover/sidebar:max-w-[11rem] md:group-hover/sidebar:opacity-100",
              "md:group-focus-within/sidebar:max-w-[11rem] md:group-focus-within/sidebar:opacity-100"
            )}
          >
            {displayName}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => void logout()}
          title="Se déconnecter"
          aria-label="Se déconnecter"
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-xl py-2.5 pl-2 pr-2 text-left text-ink-secondary transition-colors hover:bg-accent-red/15 hover:text-accent-red-hover md:pl-3",
            focusVisibleRingInsetClass
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
            <LogOut className="h-5 w-5" aria-hidden />
          </span>
          <span
            className={cn(
              "min-w-0 truncate text-sm font-medium transition-[max-width,opacity] duration-300 ease-out",
              "max-w-0 overflow-hidden opacity-0",
              "md:group-hover/sidebar:max-w-[11rem] md:group-hover/sidebar:opacity-100",
              "md:group-focus-within/sidebar:max-w-[11rem] md:group-focus-within/sidebar:opacity-100"
            )}
          >
            Déconnexion
          </span>
        </button>
      </div>
    </aside>
  );
}
