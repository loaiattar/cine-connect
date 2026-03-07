import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MovieHero from "@/components/ui/MovieHero";
import RateMovie, { type RateMovieProps } from "@/components/ui/RateMovie";
import CommentSection from "@/components/ui/CommentSectionComponent";
import { apiMovieToDisplay } from "@/lib/movie-adapter";
import type { Movie } from "@cine-connect/shared";
import { moviesService, type MovieRatingResponse } from "@/service/movies.service";
import { useAuth } from "@/hooks/useAuth";
import { useMovieDetail } from "@/hooks/useMovies";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/movie/$movieId")({
  component: MovieDetailPage,
});

function MovieDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { movieId } = Route.useParams();
  const movieIdNum = Number(movieId);
  const { user, isAuthenticated: isLoggedIn } = useAuth();

  const { data: rawMovie, isLoading, isError, error } = useMovieDetail(movieIdNum);

  const {
    data: ratingData,
  } = useQuery({
    queryKey: ["movie", "rating", movieIdNum],
    queryFn: () => moviesService.getMovieRating(movieIdNum),
    enabled: Number.isInteger(movieIdNum) && movieIdNum > 0,
  });

  const ratingPayload: MovieRatingResponse | null =
    ratingData != null && typeof ratingData === "object"
      ? "average" in ratingData
        ? (ratingData as unknown as MovieRatingResponse)
        : "data" in ratingData && (ratingData as { data: unknown }).data != null
          ? ((ratingData as { data: MovieRatingResponse }).data)
          : null
      : null;

  const submitRatingMutation = useMutation({
    mutationFn: ({ movieId: id, rating }: { movieId: number; rating: number }) =>
      moviesService.submitRating(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie", "rating", movieIdNum] });
    },
  });

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
                const rating = Math.min(10, Math.max(1, stars * 2));
                submitRatingMutation.mutate({ movieId: movieIdNum, rating });
              },
            } satisfies RateMovieProps)}
          />
          {submitRatingMutation.isPending && (
            <p className="text-gray-400 text-sm mt-2">Enregistrement…</p>
          )}
          {submitRatingMutation.isError && (
            <p className="text-red-400 text-sm mt-2">
              {submitRatingMutation.error && typeof submitRatingMutation.error === "object" && "message" in submitRatingMutation.error
                ? String((submitRatingMutation.error as { message: string }).message)
                : "Erreur lors de l'enregistrement de la note"}
            </p>
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
