import { createFileRoute, Link } from "@tanstack/react-router";
import { useNotifications } from "@/hooks/useNotifications";
import { requireAuth } from "@/lib/route-guard";
import { Bell, Clapperboard, Loader2, Check, CheckCheck } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/90 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-white hover:text-zinc-300 transition-colors"
          >
            <Clapperboard className="w-6 h-6 text-red-500" />
            <span>
              <span className="text-red-500">Ciné</span>
              <span className="text-orange-400">Connect</span>
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-sm text-zinc-400">
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
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
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
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <p className="text-zinc-400">Chargement des notifications…</p>
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
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
            <p className="text-zinc-400">Aucune notification.</p>
          </div>
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
                  <p className="text-zinc-200">{n.message}</p>
                  <p className="mt-1 text-xs text-zinc-500">{formatDate(n.createdAt)}</p>
                </div>
              );

              return (
                <li
                  key={n.id}
                  className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 ${
                    n.readAt ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-700 bg-zinc-900/50"
                  }`}
                >
                  {linkToProfile ? (
                    <Link
                      to="/profile/$userId"
                      params={{ userId: String(n.targetId!) }}
                      className="min-w-0 flex-1 block hover:bg-zinc-800/50 rounded -m-2 p-2 transition-colors"
                    >
                      {content}
                    </Link>
                  ) : linkToMovie ? (
                    <Link
                      to="/movie/$movieId"
                      params={{ movieId: String(n.targetId!) }}
                      className="min-w-0 flex-1 block hover:bg-zinc-800/50 rounded -m-2 p-2 transition-colors"
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
                      className="shrink-0 rounded p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
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
    </div>
  );
}
