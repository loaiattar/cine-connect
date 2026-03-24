import { createFileRoute, Link } from "@tanstack/react-router";
import { useNotifications } from "@/hooks/useNotifications";
import { requireAuth } from "@/lib/route-guard";
import { Bell, Loader2, Check, CheckCheck } from "lucide-react";
import { GlassPanel } from "@/components/glass";

export const Route = createFileRoute("/notifications")({
  beforeLoad: () => requireAuth(),
  component: NotificationsPage,
});

function formatDate(s: string | null) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationsPage() {
  const {
    notifications,
    total,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    isMarking,
    markError,
    unreadCount,
  } = useNotifications({ refetchInterval: 60_000 });

  return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-accent-red" aria-hidden />
            <div>
              <h1 className="text-2xl font-bold text-ink">Notifications</h1>
              <p className="text-sm text-ink-secondary">
                {total} notification{total !== 1 ? "s" : ""}
                {unreadCount > 0 && ` · ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={isMarking}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm font-medium text-ink hover:bg-[var(--glass-bg-elevated)] disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Tout marquer lu
            </button>
          )}
        </div>

        {markError && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-red-200 text-sm">
            {markError.message}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
            <p className="text-ink-secondary">Chargement des notifications…</p>
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-red-200">
            <p>{error instanceof Error ? error.message : "Impossible de charger les notifications."}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <GlassPanel className="py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-ink-muted" aria-hidden />
            <p className="text-ink-secondary">Aucune notification.</p>
          </GlassPanel>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <ul className="space-y-2">
            {notifications.map((n) => {
              const hasLink =
                n.linkType != null &&
                n.linkType !== "" &&
                n.targetId != null &&
                Number.isInteger(n.targetId) &&
                n.targetId > 0;
              const linkToProfile = hasLink && n.linkType === "profile";
              const linkToMovie = hasLink && n.linkType === "movie";

              const content = (
                <div className="min-w-0 flex-1">
                  <p className="text-ink">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-muted">{formatDate(n.createdAt)}</p>
                </div>
              );

              return (
                <li
                  key={n.id}
                  className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 ${
                    n.readAt
                      ? "border-[var(--glass-border)] bg-[var(--glass-bg)]/50"
                      : "border-[var(--glass-border-strong)] bg-[var(--glass-bg)]"
                  }`}
                >
                  {linkToProfile ? (
                    <Link
                      to="/profile/$userId"
                      params={{ userId: String(n.targetId!) }}
                      className="-m-2 block min-w-0 flex-1 rounded-lg p-2 transition-colors hover:bg-[var(--glass-bg-elevated)]"
                    >
                      {content}
                    </Link>
                  ) : linkToMovie ? (
                    <Link
                      to="/movie/$movieId"
                      params={{ movieId: String(n.targetId!) }}
                      className="-m-2 block min-w-0 flex-1 rounded-lg p-2 transition-colors hover:bg-[var(--glass-bg-elevated)]"
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                  {!n.readAt && (
                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      disabled={isMarking}
                      className="shrink-0 rounded-lg p-2 text-ink-secondary transition-colors hover:bg-[var(--glass-bg-elevated)] hover:text-ink disabled:opacity-50"
                      title="Marquer comme lu"
                      aria-label="Marquer comme lu"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
  );
}
