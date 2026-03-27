import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useProfile";
import { useFollow } from "@/hooks/useFollow";
import { useFavorites } from "@/hooks/useFavorites";
import { useWatchlist } from "@/hooks/useWatchlist";
import { requireAuth } from "@/lib/route-guard";
import { Bookmark, Heart, Loader2, User, Users } from "lucide-react";
import { GlassPanel, PosterCard, PrimaryButton } from "@/components/glass";
import { RoundedAvatarImage } from "@/components/ui/RoundedAvatarImage";
import { moviesService } from "@/service/movies.service";
import { resolveMediaUrl } from "@/lib/api-origin";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => requireAuth(),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, isLoading, isError, error, refetch } = useProfile();
  const { favorites, isLoading: isFavoritesLoading } = useFavorites();
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();

  const profileUserId = user?.id ?? null;
  const {
    followError,
    followers,
    followersTotal,
    followersLoading,
    following,
    followingTotal,
    followingLoading,
  } = useFollow(profileUserId, { fetchFollowers: true, fetchFollowing: true });

  const displayName = user?.name ?? user?.email ?? "";
  const avatarDisplay = resolveMediaUrl(profile?.avatarUrl ?? null);
  const favoritePreview = favorites.slice(0, 6);
  const watchlistPreview = watchlist.slice(0, 6);

  const favoriteMovieQueries = useQueries({
    queries: favoritePreview.map((entry) => ({
      queryKey: ["movie", entry.externalMovieId],
      queryFn: () => moviesService.getMovieById(entry.externalMovieId),
      enabled: favoritePreview.length > 0,
    })),
  });

  const watchlistMovieQueries = useQueries({
    queries: watchlistPreview.map((entry) => ({
      queryKey: ["movie", entry.externalMovieId],
      queryFn: () => moviesService.getMovieById(entry.externalMovieId),
      enabled: watchlistPreview.length > 0,
    })),
  });

  return (
      <main className="mx-auto min-h-full max-w-6xl px-4 py-6 md:px-6">
        {isLoading && (
          <GlassPanel className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
            <p className="text-ink-secondary">Chargement du profil…</p>
          </GlassPanel>
        )}

        {isError && (
          <GlassPanel className="border-red-500/40">
            <p>{error instanceof Error ? error.message : "Impossible de charger le profil."}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Réessayer
            </button>
          </GlassPanel>
        )}

        {!isLoading && !isError && user && (
          <div className="space-y-8">
            <GlassPanel className="flex items-center gap-4">
              {avatarDisplay ? (
                <RoundedAvatarImage
                  src={avatarDisplay}
                  alt=""
                  sizeClassName="h-20 w-20"
                  ringClassName="ring-1 ring-[var(--glass-border)]"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--glass-bg-elevated)] ring-1 ring-[var(--glass-border)]">
                  <User className="h-10 w-10 text-ink-muted" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-ink">{displayName}</h1>
                <p className="text-sm text-ink-secondary">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-secondary">
                  {followersLoading || followingLoading ? (
                    <span>Chargement…</span>
                  ) : (
                    <>
                      <span><span className="font-semibold text-ink">{followersTotal}</span> abonnés</span>
                      <span><span className="font-semibold text-ink">{followingTotal}</span> abonnements</span>
                    </>
                  )}
                </div>
                <div className="mt-3">
                  {followError && (
                    <p className="mb-1 text-sm text-red-300">{followError.message}</p>
                  )}
                  <PrimaryButton asChild>
                    <Link to="/settings">Modifier mon profil</Link>
                  </PrimaryButton>
                </div>
              </div>
            </GlassPanel>

            <div className="grid gap-4 sm:grid-cols-3">
              <GlassPanel>
                <div className="flex items-center gap-2 text-ink-secondary">
                  <Heart className="h-4 w-4 text-accent-red" aria-hidden />
                  <span className="text-sm">Likes / Favoris</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-ink">
                  {isFavoritesLoading ? "…" : favorites.length}
                </p>
              </GlassPanel>
              <GlassPanel>
                <div className="flex items-center gap-2 text-ink-secondary">
                  <Bookmark className="h-4 w-4 text-accent-red" aria-hidden />
                  <span className="text-sm">A voir</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-ink">
                  {isWatchlistLoading ? "…" : watchlist.length}
                </p>
              </GlassPanel>
              <GlassPanel>
                <div className="flex items-center gap-2 text-ink-secondary">
                  <Users className="h-4 w-4 text-accent-red" aria-hidden />
                  <span className="text-sm">Reseau</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-ink">
                  {followersLoading || followingLoading ? "…" : followersTotal + followingTotal}
                </p>
              </GlassPanel>
            </div>

            <GlassPanel className="space-y-3">
              <h2 className="text-lg font-semibold text-ink">Informations</h2>
              <div className="grid gap-3 text-sm text-ink-secondary sm:grid-cols-2">
                <p>
                  <span className="font-medium text-ink">Ville:</span>{" "}
                  {profile?.location?.trim() || "Non renseignee"}
                </p>
                <p>
                  <span className="font-medium text-ink">Genre prefere:</span>{" "}
                  {profile?.favoriteGenre?.trim() || "Non renseigne"}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium text-ink">Bio:</span>{" "}
                  {profile?.bio?.trim() || "Aucune bio pour le moment."}
                </p>
              </div>
            </GlassPanel>

            <GlassPanel>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">Favoris ({favorites.length})</h2>
                <Link to="/favorites" className="text-sm text-ink-secondary underline hover:no-underline">
                  Voir tout
                </Link>
              </div>
              {favoritePreview.length === 0 ? (
                <p className="text-sm text-ink-muted">Aucun favori pour le moment.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  {favoritePreview.map((entry, index) => {
                    const movie = favoriteMovieQueries[index]?.data;
                    if (!movie) {
                      return (
                        <div key={entry.id} className="flex aspect-[2/3] items-center justify-center rounded-xl bg-[var(--glass-bg-elevated)]">
                          <Loader2 className="h-5 w-5 animate-spin text-ink-muted" aria-hidden />
                        </div>
                      );
                    }
                    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
                    return (
                      <Link key={entry.id} to="/movie/$movieId" params={{ movieId: String(entry.externalMovieId) }}>
                        <PosterCard
                          title={movie.title ?? "Sans titre"}
                          posterPath={movie.poster_path ?? ""}
                          year={Number.isNaN(year) ? undefined : year}
                          rating={typeof movie.vote_average === "number" ? Math.round(movie.vote_average * 10) / 10 : undefined}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </GlassPanel>

            <GlassPanel>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">Watchlist ({watchlist.length})</h2>
                <Link to="/watchlist" className="text-sm text-ink-secondary underline hover:no-underline">
                  Voir tout
                </Link>
              </div>
              {watchlistPreview.length === 0 ? (
                <p className="text-sm text-ink-muted">Aucun film dans votre liste a voir.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  {watchlistPreview.map((entry, index) => {
                    const movie = watchlistMovieQueries[index]?.data;
                    if (!movie) {
                      return (
                        <div key={entry.id} className="flex aspect-[2/3] items-center justify-center rounded-xl bg-[var(--glass-bg-elevated)]">
                          <Loader2 className="h-5 w-5 animate-spin text-ink-muted" aria-hidden />
                        </div>
                      );
                    }
                    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
                    return (
                      <Link key={entry.id} to="/movie/$movieId" params={{ movieId: String(entry.externalMovieId) }}>
                        <PosterCard
                          title={movie.title ?? "Sans titre"}
                          posterPath={movie.poster_path ?? ""}
                          year={Number.isNaN(year) ? undefined : year}
                          rating={typeof movie.vote_average === "number" ? Math.round(movie.vote_average * 10) / 10 : undefined}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </GlassPanel>

            {(followers.length > 0 || following.length > 0) && (
              <div className="grid gap-6 sm:grid-cols-2">
                {followers.length > 0 && (
                  <GlassPanel>
                    <h2 className="mb-2 text-lg font-semibold text-ink">Abonnés ({followersTotal})</h2>
                    <ul className="space-y-2">
                      {followers.slice(0, 10).map((u) => (
                        <li key={u.id}>
                          <Link
                            to="/profile/$userId"
                            params={{ userId: String(u.id) }}
                            className="text-sm text-ink-secondary transition-colors hover:text-ink"
                          >
                            {u.name?.trim() || "Utilisateur"}
                          </Link>
                        </li>
                      ))}
                      {followersTotal > 10 && (
                        <li className="text-sm text-ink-muted">… et {followersTotal - 10} autres</li>
                      )}
                    </ul>
                  </GlassPanel>
                )}
                {following.length > 0 && (
                  <GlassPanel>
                    <h2 className="mb-2 text-lg font-semibold text-ink">Abonnements ({followingTotal})</h2>
                    <ul className="space-y-2">
                      {following.slice(0, 10).map((u) => (
                        <li key={u.id}>
                          <Link
                            to="/profile/$userId"
                            params={{ userId: String(u.id) }}
                            className="text-sm text-ink-secondary transition-colors hover:text-ink"
                          >
                            {u.name?.trim() || "Utilisateur"}
                          </Link>
                        </li>
                      ))}
                      {followingTotal > 10 && (
                        <li className="text-sm text-ink-muted">… et {followingTotal - 10} autres</li>
                      )}
                    </ul>
                  </GlassPanel>
                )}
              </div>
            )}
          </div>
        )}
      </main>
  );
}
