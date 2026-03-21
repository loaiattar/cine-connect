import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";
import { requireAuth } from "@/lib/route-guard";
import MovieCard from "@/components/ui/CardFilm";
import { getMovieImageUrl } from "@/lib/utils";
import { moviesService } from "@/service/movies.service";
import { MOVIE_GENRES } from "@cine-connect/shared";
import { Clapperboard, Loader2, Bookmark, Trash2 } from "lucide-react";

function getGenreNames(genreIds: number[] | undefined): string[] {
  if (!genreIds?.length) return [];
  const map = new Map(MOVIE_GENRES.map((g) => [g.id, g.name]));
  return genreIds.map((id) => map.get(id) ?? "").filter(Boolean);
}

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlist.map((entry, index) => {
              const query = movieQueries[index];
              const movie = query?.data;
              const isLoadingMovie = query?.isLoading ?? true;

              if (isLoadingMovie || !movie) {
                return (
                  <div
                    key={entry.id}
                    className="relative rounded-xl overflow-hidden w-full h-[360px] bg-zinc-900 flex items-center justify-center"
                  >
                    <Loader2 className="h-10 w-10 animate-spin text-zinc-600" aria-hidden />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWatchlist(entry.externalMovieId);
                      }}
                      disabled={isToggling}
                      className="absolute top-2 right-2 z-10 rounded p-1.5 bg-black/60 text-zinc-400 hover:bg-orange-950/80 hover:text-orange-400 transition-colors disabled:opacity-50"
                      title="Retirer de la liste"
                      aria-label="Retirer de la liste"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              }

              const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
              const genreNames =
                movie.genres?.map((g) => g.name) ?? getGenreNames((movie as unknown as { genre_ids?: number[] }).genre_ids);

              return (
                <div key={entry.id} className="relative group">
                  <Link
                    to="/movie/$movieId"
                    params={{ movieId: String(entry.externalMovieId) }}
                    className="block focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl overflow-hidden"
                  >
                    <MovieCard
                      id={movie.id}
                      title={movie.title ?? "Sans titre"}
                      year={Number.isNaN(year) ? 0 : year}
                      rating={
                        typeof movie.vote_average === "number"
                          ? Math.round(movie.vote_average * 10) / 10
                          : 0
                      }
                      imageUrl={getMovieImageUrl(movie.poster_path ?? "")}
                      genres={genreNames}
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
                    className="absolute top-2 right-2 z-10 rounded p-1.5 bg-black/60 text-zinc-400 hover:bg-orange-950/80 hover:text-orange-400 transition-colors disabled:opacity-50"
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
    </div>
  );
}
