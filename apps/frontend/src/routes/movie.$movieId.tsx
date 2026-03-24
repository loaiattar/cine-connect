import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import MovieHero from "@/components/ui/MovieHero";
import RateMovie, { type RateMovieProps } from "@/components/ui/RateMovie";
import CommentSection from "@/components/ui/CommentSectionComponent";
import { apiMovieToDisplay } from "@/lib/movie-adapter";
import type { Movie } from "@cine-connect/shared";
import { useAuth } from "@/hooks/useAuth";
import { useMovieDetail } from "@/hooks/useMovies";
import { useRating } from "@/hooks/useRating";
import { Loader2, MessageCircle } from "lucide-react";
import { GlassPanel, PrimaryButton } from "@/components/glass";

export const Route = createFileRoute("/movie/$movieId")({
  component: MovieDetailPage,
});

function MovieDetailPage() {
  const navigate = useNavigate();
  const { movieId } = Route.useParams();
  const movieIdNum = Number(movieId);
  const { user, isAuthenticated: isLoggedIn } = useAuth();

  const { data: rawMovie, isLoading, isError, error } = useMovieDetail(movieIdNum);
  const {
    rating: ratingPayload,
    setRating,
    isSubmitting: ratingSubmitting,
    submitError: ratingError,
  } = useRating(movieIdNum);

  const movie = rawMovie ? apiMovieToDisplay(rawMovie as Movie & { isFavorite?: boolean; isOnWatchlist?: boolean; comments?: unknown[] }) : null;

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
