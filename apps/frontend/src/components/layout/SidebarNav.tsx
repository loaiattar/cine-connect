import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bookmark,
  Clapperboard,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { focusVisibleRingInsetClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/api-origin";
import { RoundedAvatarImage } from "@/components/ui/RoundedAvatarImage";

export type NavItemConfig = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** When true, only exact `to` matches (e.g. home). */
  end?: boolean;
  /** Custom active check (e.g. profile subtree). */
  isActive?: (pathname: string) => boolean;
  /** Required for routes with validated search params (e.g. `/search`). */
  search?: { q: string; page: number; list?: "trending" | "top_rated"; genre?: number };
};

const MAIN_NAV: NavItemConfig[] = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/search", label: "Recherche", icon: Search, end: true, search: { q: "", page: 1 } },
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

/** Desktop rail: center icon when collapsed; on sidebar expand, align with labels. Padding fits w-14 minus nav padding. */
const sidebarRailRowClass = cn(
  "flex min-w-0 items-center rounded-xl py-2.5 transition-colors",
  "justify-center gap-0 px-1.5",
  "motion-safe:transition-[gap,padding] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none",
  "md:group-hover/sidebar:justify-start md:group-hover/sidebar:gap-3 md:group-hover/sidebar:pl-3 md:group-hover/sidebar:pr-2",
  "md:group-focus-within/sidebar:justify-start md:group-focus-within/sidebar:gap-3 md:group-focus-within/sidebar:pl-3 md:group-focus-within/sidebar:pr-2"
);

export function NavItem({
  item,
  pathname,
  badge,
  variant = "rail",
  onMenuClose,
}: {
  item: NavItemConfig;
  pathname: string;
  badge?: number;
  /** `drawer`: always show label (mobile menu). `rail`: icon-only until hover/focus on md+. */
  variant?: "rail" | "drawer";
  /** Mobile drawer: call after navigation intent (closes menu). */
  onMenuClose?: () => void;
}) {
  const active = navItemActive(pathname, item);
  const Icon = item.icon;
  const isDrawer = variant === "drawer";

  return (
    <Link
      to={item.to}
      {...(item.search != null ? { search: item.search } : {})}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      onClick={() => onMenuClose?.()}
      className={cn(
        isDrawer ? cn("flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors") : sidebarRailRowClass,
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
          "min-w-0 truncate text-sm font-medium",
          isDrawer
            ? "flex-1 text-left opacity-100"
            : cn(
                "flex-none md:group-hover/sidebar:flex-1 md:group-focus-within/sidebar:flex-1",
                "transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none",
                "max-w-0 overflow-hidden opacity-0",
                "md:group-hover/sidebar:max-w-[11rem] md:group-hover/sidebar:opacity-100",
                "md:group-focus-within/sidebar:max-w-[11rem] md:group-focus-within/sidebar:opacity-100"
              )
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

/**
 * Below `md`: sticky top bar + hamburger opens a left drawer with full labels (issue #314 / plan §5 C.8).
 * `md` and up: hidden (desktop uses {@link SidebarNav} rail).
 */
function MobileNavDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout } = useAuth();
  const { user: profileUser, profile } = useProfile();
  const { unreadCount } = useNotifications({ limit: 100 });

  const displayName = profileUser?.name ?? profileUser?.email ?? "Profil";
  const avatarUrl = profile?.avatarUrl ?? null;
  const avatarSrc = resolveMediaUrl(avatarUrl);

  return (
    <div className="md:hidden">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <header className="flex h-14 min-h-14 shrink-0 items-center gap-2 border-b border-[var(--glass-border)] bg-[var(--glass-bg)]/95 px-3 backdrop-blur-[var(--glass-blur)] supports-[backdrop-filter]:bg-[var(--glass-bg)]/80">
          <Dialog.Trigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-elevated)] text-ink",
                focusVisibleRingInsetClass
              )}
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="h-6 w-6 shrink-0" aria-hidden />
            </button>
          </Dialog.Trigger>
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className={cn(
              "min-w-0 flex-1 truncate py-2 text-base font-extrabold tracking-tight",
              focusVisibleRingInsetClass
            )}
          >
            <span className="text-accent-red">Lume</span>
            <span className="text-ink">ra</span>
          </Link>
        </header>

        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              "fixed inset-0 z-[200] bg-black/45 backdrop-blur-[2px]",
              "data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out",
              "data-[state=open]:motion-safe:fade-in-0 data-[state=closed]:motion-safe:fade-out-0",
              "motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none"
            )}
          />
          <Dialog.Content
            className={cn(
              "!fixed !left-0 !top-0 z-[201] flex h-dvh max-h-dvh w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] flex-col !translate-x-0 !translate-y-0 outline-none",
              "border-r border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-2xl backdrop-blur-[var(--glass-blur)]",
              "data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out",
              "data-[state=open]:motion-safe:slide-in-from-left-2 data-[state=closed]:motion-safe:slide-out-to-left-2",
              "motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none",
              "duration-200"
            )}
          >
            <Dialog.Title className="sr-only">Navigation principale</Dialog.Title>
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--glass-border)] p-3">
              <span className="truncate text-sm font-extrabold tracking-tight">
                <span className="text-accent-red">Lume</span>
                <span className="text-ink">ra</span>
              </span>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-secondary hover:bg-[var(--glass-bg-elevated)] hover:text-ink",
                    focusVisibleRingInsetClass
                  )}
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </Dialog.Close>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden overscroll-contain p-2">
              {MAIN_NAV.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  pathname={pathname}
                  variant="drawer"
                  badge={item.to === "/notifications" ? unreadCount : undefined}
                  onMenuClose={() => setOpen(false)}
                />
              ))}
            </nav>

            <div className="shrink-0 space-y-1 border-t border-[var(--glass-border)] p-2">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                aria-label="Paramètres du compte"
                aria-current={pathname === "/settings" ? "page" : undefined}
                className={cn(
                  "flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-ink-secondary transition-colors hover:bg-[var(--glass-bg-elevated)] hover:text-ink",
                  focusVisibleRingInsetClass,
                  pathname === "/settings" && "bg-accent-red/20 text-accent-red"
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                  <Settings className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">Paramètres</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                aria-label={`Mon profil — ${displayName}`}
                className={cn(
                  "flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[var(--glass-bg-elevated)]",
                  focusVisibleRingInsetClass
                )}
              >
                {avatarSrc ? (
                  <RoundedAvatarImage src={avatarSrc} alt="" sizeClassName="h-9 w-9" />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--glass-bg-elevated)] text-sm font-medium text-ink ring-1 ring-[var(--glass-border)]">
                    {displayName.slice(0, 1).toUpperCase() || "?"}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-ink-secondary">
                  {displayName}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void logout();
                }}
                aria-label="Se déconnecter"
                className={cn(
                  "flex min-w-0 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-ink-secondary transition-colors hover:bg-accent-red/15 hover:text-accent-red-hover",
                  focusVisibleRingInsetClass
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                  <LogOut className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/**
 * Desktop (`md+`): collapsed icon rail; expands on hover / focus-within (CinéConnectPlan §2).
 * Below `md`: top bar + hamburger drawer; this aside is hidden (issue #314).
 */
export function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout } = useAuth();
  const { user: profileUser, profile } = useProfile();
  const { unreadCount } = useNotifications({ limit: 100 });

  const displayName = profileUser?.name ?? profileUser?.email ?? "Profil";
  const avatarUrl = profile?.avatarUrl ?? null;
  const avatarSrc = resolveMediaUrl(avatarUrl);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 md:hidden">
        <MobileNavDrawer />
      </div>
      <aside
        className={cn(
          "group/sidebar hidden h-dvh w-14 shrink-0 flex-col overflow-x-hidden border-r border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] md:flex",
          "motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none",
          "md:hover:w-56 md:focus-within:w-56"
        )}
        aria-label="Navigation principale"
      >
      <div className="flex shrink-0 flex-col gap-1 border-b border-[var(--glass-border)] p-2">
        <Link
          to="/"
          title="Lumera"
          aria-label="Lumera — accueil"
          className={cn(sidebarRailRowClass, "text-ink", focusVisibleRingInsetClass)}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Clapperboard className="h-6 w-6 text-accent-red" aria-hidden />
          </span>
          <span
            className={cn(
              "flex-none truncate text-sm font-extrabold tracking-tight transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none md:group-hover/sidebar:flex-1 md:group-focus-within/sidebar:flex-1",
              "max-w-0 overflow-hidden opacity-0",
              "md:group-hover/sidebar:max-w-[11rem] md:group-hover/sidebar:opacity-100",
              "md:group-focus-within/sidebar:max-w-[11rem] md:group-focus-within/sidebar:opacity-100"
            )}
          >
            <span className="text-accent-red">Lume</span>
            <span className="text-ink">ra</span>
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
          to="/settings"
          title="Paramètres"
          aria-label="Paramètres du compte"
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={cn(
            sidebarRailRowClass,
            "text-ink-secondary transition-colors hover:bg-[var(--glass-bg-elevated)] hover:text-ink",
            focusVisibleRingInsetClass,
            pathname === "/settings" && "bg-accent-red/20 text-accent-red"
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Settings className="h-5 w-5" aria-hidden />
          </span>
          <span
            className={cn(
              "min-w-0 flex-none truncate text-sm font-medium transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none md:group-hover/sidebar:flex-1 md:group-focus-within/sidebar:flex-1",
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
            sidebarRailRowClass,
            "text-ink transition-colors hover:bg-[var(--glass-bg-elevated)]",
            focusVisibleRingInsetClass
          )}
        >
          {avatarSrc ? (
            <RoundedAvatarImage src={avatarSrc} alt="" sizeClassName="h-9 w-9" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--glass-bg-elevated)] text-sm font-medium text-ink ring-1 ring-[var(--glass-border)]">
              {displayName.slice(0, 1).toUpperCase() || "?"}
            </span>
          )}
          <span
            className={cn(
              "min-w-0 flex-none truncate text-sm font-medium text-ink-secondary transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none md:group-hover/sidebar:flex-1 md:group-focus-within/sidebar:flex-1",
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
            sidebarRailRowClass,
            "text-left text-ink-secondary transition-colors hover:bg-accent-red/15 hover:text-accent-red-hover",
            focusVisibleRingInsetClass
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
            <LogOut className="h-5 w-5" aria-hidden />
          </span>
          <span
            className={cn(
              "min-w-0 flex-none truncate text-sm font-medium transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none md:group-hover/sidebar:flex-1 md:group-focus-within/sidebar:flex-1",
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
    </>
  );
}
