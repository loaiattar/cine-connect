import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MovieHero from "@/components/ui/MovieHero";
import RateMovie, { type RateMovieProps } from "@/components/ui/RateMovie";
import CommentSection from "@/components/ui/CommentSectionComponent";
import { apiMovieToDisplay } from "@/lib/movie-adapter";
import type { Movie } from "@cine-connect/shared";
import { useAuth } from "@/hooks/useAuth";
import { useMovieDetail } from "@/hooks/useMovies";
import { useRating } from "@/hooks/useRating";
import { Loader2 } from "lucide-react";

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" aria-hidden />
        <span className="sr-only">Chargement du film…</span>
      </div>
    );
  }

  if (isError || !movie) {
    const message = error && typeof error === "object" && "message" in error ? String((error as { message: string }).message) : "Ce film est introuvable.";
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-400 text-center">{message}</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-white hover:bg-zinc-600 transition-colors"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  const currentUser = user?.email ?? undefined;

  return (
    <div className="min-h-screen bg-gray-950">
      <MovieHero
        title={movie.title}
        year={movie.year}
        director={movie.director}
        genres={movie.genres}
        rating={movie.rating}
        posterUrl={movie.posterUrl}
        onBack={() => navigate({ to: "/" })}
      />

      <div className="w-full space-y-6 py-6 px-4">
        <section>
          <h2 className="text-white font-bold text-lg mb-3">Synopsis</h2>
          <p className="text-gray-300 leading-relaxed text-sm">{movie.synopsis}</p>
        </section>

        <section className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-4">
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
            <p className="text-gray-400 text-sm mt-2">Enregistrement…</p>
          )}
          {ratingError && (
            <p className="text-red-400 text-sm mt-2">{ratingError.message}</p>
          )}
        </section>

        <section>
          <CommentSection
            movieId={movieIdNum}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser ?? ""}
          />
        </section>
      </div>

      <div className="px-4 pb-8">
        <div className="bg-red-950 border border-red-800 rounded-xl p-8">
          <button
            type="button"
            className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg px-6 py-2 mx-auto block transition-colors"
          >
            Ouvrir le chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
