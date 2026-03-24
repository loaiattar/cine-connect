import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { requireAuth } from "@/lib/route-guard";
import { moviesService } from "@/service/movies.service";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { GlassPanel, PosterCard, PrimaryButton } from "@/components/glass";

export const Route = createFileRoute("/favorites")({
  beforeLoad: () => requireAuth(),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const { user: profileUser } = useProfile();
  const displayName = profileUser?.name ?? user?.email ?? "";
  const {
    favorites,
    isLoading,
    isError,
    error,
    removeFavorite,
    isToggling,
  } = useFavorites();

  const movieQueries = useQueries({
    queries: favorites.map((fav) => ({
      queryKey: ["movie", fav.externalMovieId],
      queryFn: () => moviesService.getMovieById(fav.externalMovieId),
      enabled: favorites.length > 0,
    })),
  });

  return (
    <main className="mx-auto min-h-full max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 fill-accent-red text-accent-red" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-ink">Mes favoris</h1>
          <p className="text-sm text-ink-secondary">{displayName}</p>
        </div>
      </div>

      {isLoading && (
        <GlassPanel className="flex flex-col items-center justify-center gap-4 py-16">
          <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
          <p className="text-sm text-ink-secondary">Chargement de vos favoris…</p>
        </GlassPanel>
      )}

      {isError && (
        <GlassPanel className="border-red-500/40">
          <p className="text-sm text-red-300">
            {error instanceof Error ? error.message : "Impossible de charger les favoris."}
          </p>
        </GlassPanel>
      )}

      {!isLoading && !isError && favorites.length === 0 && (
        <GlassPanel className="py-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-ink-muted" aria-hidden />
          <p className="text-ink-secondary">Aucun film en favori pour le moment.</p>
          <p className="mt-2 text-sm text-ink-muted">
            Ajoutez des films depuis leur fiche pour les retrouver ici.
          </p>
          <PrimaryButton asChild className="mt-6">
            <Link to="/">Découvrir des films</Link>
          </PrimaryButton>
        </GlassPanel>
      )}

      {!isLoading && !isError && favorites.length > 0 && (
        <GlassPanel>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {favorites.map((fav, index) => {
              const query = movieQueries[index];
              const movie = query?.data;
              const isLoadingMovie = query?.isLoading ?? true;

              if (isLoadingMovie || !movie) {
                return (
                  <GlassPanel
                    key={fav.id}
                    className="relative flex aspect-[2/3] items-center justify-center !p-0"
                  >
                    <Loader2 className="h-10 w-10 animate-spin text-ink-muted" aria-hidden />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFavorite(fav.externalMovieId);
                      }}
                      disabled={isToggling}
                      className="absolute right-2 top-2 z-10 rounded-lg bg-black/60 p-1.5 text-ink-secondary transition-colors hover:bg-accent-red-subtle/40 hover:text-accent-red-hover disabled:opacity-50"
                      title="Retirer des favoris"
                      aria-label="Retirer des favoris"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </GlassPanel>
                );
              }

              const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;

              return (
                <div key={fav.id} className="group relative">
                  <Link
                    to="/movie/$movieId"
                    params={{ movieId: String(fav.externalMovieId) }}
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
                      removeFavorite(fav.externalMovieId);
                    }}
                    disabled={isToggling}
                    className="absolute right-2 top-2 z-10 rounded-lg bg-black/60 p-1.5 text-ink-secondary transition-colors hover:bg-accent-red-subtle/40 hover:text-accent-red-hover disabled:opacity-50"
                    title="Retirer des favoris"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      )}
    </main>
  );
}

export default FavoritesPage;
