import { createFileRoute, Link } from "@tanstack/react-router";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";
import { requireAuth } from "@/lib/route-guard";
import { Clapperboard, Loader2, Bookmark, Trash2 } from "lucide-react";

export const Route = createFileRoute("/watchlist")({
  beforeLoad: () => requireAuth(),
  component: WatchlistPage,
});

function WatchlistPage() {
  const { user } = useAuth();
  const {
    watchlist,
    isLoading,
    isError,
    error,
    removeFromWatchlist,
    isToggling,
  } = useWatchlist();

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
        <div className="mb-8 flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-orange-400 fill-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Ma liste à voir</h1>
            <p className="text-sm text-zinc-400">
              {user?.email}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-orange-400" />
            <p className="text-zinc-400">Chargement de votre liste…</p>
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-red-200">
            <p>
              {error instanceof Error ? error.message : "Impossible de charger la liste à voir."}
            </p>
          </div>
        )}

        {!isLoading && !isError && watchlist.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
            <p className="text-zinc-400">Aucun film dans votre liste à voir.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Parcourez le catalogue et ajoutez des films à voir plus tard.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
            >
              Découvrir des films
            </Link>
          </div>
        )}

        {!isLoading && !isError && watchlist.length > 0 && (
          <ul className="space-y-3">
            {watchlist.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <span className="text-zinc-300">
                  Film #<span className="font-mono text-white">{entry.externalMovieId}</span>
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    to="/movie/$movieId"
                    params={{ movieId: String(entry.externalMovieId) }}
                    className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Voir la fiche →
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWatchlist(entry.externalMovieId)}
                    disabled={isToggling}
                    className="rounded p-1.5 text-zinc-400 hover:bg-orange-950/50 hover:text-orange-400 transition-colors disabled:opacity-50"
                    title="Retirer de la liste"
                    aria-label="Retirer de la liste"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
