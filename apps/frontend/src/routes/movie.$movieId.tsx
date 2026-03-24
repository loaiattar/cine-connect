import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import MovieHero from "@/components/ui/MovieHero";
import RateMovie, { type RateMovieProps } from "@/components/ui/RateMovie";
import CommentSection from "@/components/ui/CommentSectionComponent";
import { apiMovieToDisplay } from "@/lib/movie-adapter";
import type { Movie } from "@cine-connect/shared";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useMovieDetail } from "@/hooks/useMovies";
import { useRating } from "@/hooks/useRating";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Heart, ListVideo, Loader2, MessageCircle } from "lucide-react";
import { GlassPanel, PrimaryButton, ToggleRow } from "@/components/glass";

export const Route = createFileRoute("/movie/$movieId")({
  component: MovieDetailPage,
});

function MovieDetailPage() {
  const navigate = useNavigate();
  const { movieId } = Route.useParams();
  const movieIdNum = Number(movieId);
  const { user, isAuthenticated: isLoggedIn } = useAuth();

  const { data: rawMovie, isLoading, isError, error } = useMovieDetail(movieIdNum);
  const { toggleFavorite, isToggling: favoriteToggling } = useFavorites();
  const { toggleWatchlist, isToggling: watchlistToggling } = useWatchlist();
  const {
    rating: ratingPayload,
    setRating,
    isSubmitting: ratingSubmitting,
    submitError: ratingError,
  } = useRating(movieIdNum);

  type MovieDetailPayload = Movie & {
    isFavorite?: boolean;
    isOnWatchlist?: boolean;
    comments?: unknown[];
  };

  const movie = rawMovie ? apiMovieToDisplay(rawMovie as MovieDetailPayload) : null;
  const isFavorite = Boolean((rawMovie as MovieDetailPayload | undefined)?.isFavorite);
  const isOnWatchlist = Boolean((rawMovie as MovieDetailPayload | undefined)?.isOnWatchlist);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-app-base">
        <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
        <span className="sr-only">Chargement du film…</span>
      </div>
    );
  }

  if (isError || !movie) {
    const message = error && typeof error === "object" && "message" in error ? String((error as { message: string }).message) : "Ce film est introuvable.";
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-app-base px-4">
        <p className="text-center text-red-300">{message}</p>
        <PrimaryButton type="button" onClick={() => navigate({ to: "/" })}>
          Retour à l&apos;accueil
        </PrimaryButton>
      </div>
    );
  }

  const currentUser = user?.email ?? undefined;

  return (
    <div className="min-h-dvh bg-app-base">
      <MovieHero
        title={movie.title}
        year={movie.year}
        director={movie.director}
        genres={movie.genres}
        rating={movie.rating}
        posterUrl={movie.posterUrl}
        onBack={() => navigate({ to: "/" })}
      />

      <div className="w-full space-y-6 px-4 py-6">
        {isLoggedIn ? (
          <GlassPanel>
            <div className="mb-4 flex items-center gap-2">
              <ListVideo className="h-5 w-5 text-accent-red" aria-hidden />
              <h2 className="text-lg font-bold text-ink">Ma liste</h2>
            </div>
            <ToggleRow
              label="Liste de suivi"
              description="Retrouver ce film plus tard dans votre liste de lecture."
              checked={isOnWatchlist}
              onCheckedChange={() => toggleWatchlist(movieIdNum)}
              disabled={watchlistToggling}
            />
            <ToggleRow
              label="Favoris"
              description="Ajouter ce film à vos favoris."
              checked={isFavorite}
              onCheckedChange={() => toggleFavorite(movieIdNum)}
              disabled={favoriteToggling}
            />
          </GlassPanel>
        ) : (
          <GlassPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Heart className="mt-0.5 h-5 w-5 shrink-0 text-accent-red" aria-hidden />
              <p className="text-sm text-ink-secondary">
                Connectez-vous pour ajouter ce film à votre liste de suivi et à vos favoris.
              </p>
            </div>
            <PrimaryButton asChild className="shrink-0 self-start sm:self-center">
              <Link to="/login">Se connecter</Link>
            </PrimaryButton>
          </GlassPanel>
        )}

        <GlassPanel>
          <section>
            <h2 className="mb-3 text-lg font-bold text-ink">Synopsis</h2>
            <p className="text-sm leading-relaxed text-ink-secondary">{movie.synopsis}</p>
          </section>
        </GlassPanel>

        <GlassPanel>
          <RateMovie
            {...({
              average: ratingPayload?.average,
              count: ratingPayload?.count,
              userRating: ratingPayload?.userRating ?? null,
              canRate: isLoggedIn,
              onRate: (stars: number) => {
                if (stars < 1) return;
                setRating(stars * 2);
              },
            } satisfies RateMovieProps)}
          />
          {ratingSubmitting && (
            <p className="mt-2 text-sm text-ink-secondary">Enregistrement…</p>
          )}
          {ratingError && (
            <p className="mt-2 text-sm text-red-300">{ratingError.message}</p>
          )}
        </GlassPanel>

        <section>
          <CommentSection
            movieId={movieIdNum}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser ?? ""}
          />
        </section>
      </div>

      <div className="px-4 pb-8">
        <GlassPanel className="text-center">
          <PrimaryButton asChild icon={<MessageCircle className="h-5 w-5" aria-hidden />}>
            <Link to="/chat">Ouvrir le chat</Link>
          </PrimaryButton>
        </GlassPanel>
      </div>
    </div>
  );
}

export default MovieDetailPage;
