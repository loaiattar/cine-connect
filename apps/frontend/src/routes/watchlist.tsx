import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";
import { requireAuth } from "@/lib/route-guard";
import { moviesService } from "@/service/movies.service";
import { Loader2, Bookmark, Trash2 } from "lucide-react";
import { AppNavLayout } from "@/components/layout/AppNavLayout";
import { GlassPanel, PosterCard, PrimaryButton } from "@/components/glass";

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

  const movieQueries = useQueries({
    queries: watchlist.map((entry) => ({
      queryKey: ["movie", entry.externalMovieId],
      queryFn: () => moviesService.getMovieById(entry.externalMovieId),
      enabled: watchlist.length > 0,
    })),
  });

  return (
    <AppNavLayout variant="simple">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Bookmark className="h-8 w-8 fill-ink-secondary text-ink-secondary" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-ink">Ma liste à voir</h1>
            <p className="text-sm text-ink-secondary">{user?.email}</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
            <p className="text-ink-secondary">Chargement de votre liste…</p>
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
          <GlassPanel className="py-12 text-center">
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-ink-muted" aria-hidden />
            <p className="text-ink-secondary">Aucun film dans votre liste à voir.</p>
            <p className="mt-2 text-sm text-ink-muted">
              Parcourez le catalogue et ajoutez des films à voir plus tard.
            </p>
            <PrimaryButton asChild className="mt-6">
              <Link to="/">Découvrir des films</Link>
            </PrimaryButton>
          </GlassPanel>
        )}

        {!isLoading && !isError && watchlist.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlist.map((entry, index) => {
              const query = movieQueries[index];
              const movie = query?.data;
              const isLoadingMovie = query?.isLoading ?? true;

              if (isLoadingMovie || !movie) {
                return (
                  <div
                    key={entry.id}
                    className="relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]"
                  >
                    <Loader2 className="h-10 w-10 animate-spin text-ink-muted" aria-hidden />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWatchlist(entry.externalMovieId);
                      }}
                      disabled={isToggling}
                      className="absolute right-2 top-2 z-10 rounded-lg bg-black/60 p-1.5 text-ink-secondary transition-colors hover:bg-accent-red-subtle/40 hover:text-accent-red-hover disabled:opacity-50"
                      title="Retirer de la liste"
                      aria-label="Retirer de la liste"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              }

              const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;

              return (
                <div key={entry.id} className="group relative">
                  <Link
                    to="/movie/$movieId"
                    params={{ movieId: String(entry.externalMovieId) }}
                    className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base"
                  >
                    <PosterCard
                      title={movie.title ?? "Sans titre"}
                      posterPath={movie.poster_path ?? ""}
                      year={Number.isNaN(year) ? undefined : year}
                      rating={
                        typeof movie.vote_average === "number"
                          ? Math.round(movie.vote_average * 10) / 10
                          : undefined
                      }
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWatchlist(entry.externalMovieId);
                    }}
                    disabled={isToggling}
                    className="absolute right-2 top-2 z-10 rounded-lg bg-black/60 p-1.5 text-ink-secondary transition-colors hover:bg-accent-red-subtle/40 hover:text-accent-red-hover disabled:opacity-50"
                    title="Retirer de la liste"
                    aria-label="Retirer de la liste"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </AppNavLayout>
  );
}
