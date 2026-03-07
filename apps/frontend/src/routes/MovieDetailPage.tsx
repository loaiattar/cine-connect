import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import MovieHero from "@/components/ui/MovieHero";
import RateMovie, { type RateMovieProps } from "@/components/ui/RateMovie";
import CommentSection from "@/components/ui/CommentSectionComponent";
import { apiMovieToDisplay } from "@/lib/movie-adapter";
import { moviesService, type MovieRatingResponse } from "@/service/movies.service";
import { useAuthStore } from "@/stores/auth.store";
import type { Movie } from "@cine-connect/shared";

export const Route = createFileRoute("/MovieDetailPage")({
  component: MovieDetailPage,
});

function MovieDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { movieId } = Route.useSearch() as { movieId?: string };
  const movieIdNum = Number(movieId ?? 0);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!useAuthStore((s) => s.token);

  const { data: rawMovie, isLoading, isError } = useQuery({
    queryKey: ["movie", movieIdNum],
    queryFn: () => moviesService.getMovieById(movieIdNum),
    enabled: movieIdNum > 0,
  });

  const { data: ratingData } = useQuery({
    queryKey: ["movie", "rating", movieIdNum],
    queryFn: () => moviesService.getMovieRating(movieIdNum),
    enabled: movieIdNum > 0,
  });

  const submitRating = useMutation({
    mutationFn: ({ id, rating }: { id: number; rating: number }) =>
      moviesService.submitRating(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie", "rating", movieIdNum] });
    },
  });

  if (!movieId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-zinc-400">
        Aucun film sélectionné.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" />
      </div>
    );
  }

  const raw = rawMovie && typeof rawMovie === "object" && "data" in rawMovie
    ? (rawMovie as { data: Movie }).data
    : rawMovie as unknown as Movie;

  const movie = raw ? apiMovieToDisplay(raw) : null;

  const rating = ratingData && typeof ratingData === "object" && "data" in ratingData
    ? (ratingData as { data: MovieRatingResponse }).data
    : ratingData as unknown as MovieRatingResponse | null;

  if (isError || !movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950">
        <p className="text-red-400">Ce film est introuvable.</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-white hover:bg-zinc-600"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

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
          <h2 className="mb-3 text-lg font-bold text-white">Synopsis</h2>
          <p className="text-sm leading-relaxed text-gray-300">{movie.synopsis}</p>
        </section>

        <section className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-4">
          <RateMovie
            {...({
              average: rating?.average,
              count: rating?.count,
              userRating: rating?.userRating ?? null,
              canRate: isLoggedIn,
              onRate: (stars: number) => {
                submitRating.mutate({ id: movieIdNum, rating: Math.min(10, Math.max(1, stars * 2)) });
              },
            } satisfies RateMovieProps)}
          />
          {submitRating.isPending && <p className="mt-2 text-sm text-gray-400">Enregistrement…</p>}
          {submitRating.isError && <p className="mt-2 text-sm text-red-400">Erreur lors de l'enregistrement.</p>}
        </section>

        <section>
          <CommentSection
            movieId={movieIdNum}
            isLoggedIn={isLoggedIn}
            currentUser={user?.email ?? ""}
          />
        </section>
      </div>

      <div className="px-4 pb-8">
        <div className="rounded-xl border border-red-800 bg-red-950 p-8">
          <button
            type="button"
            className="mx-auto block rounded-lg bg-red-600 px-6 py-2 font-bold text-white hover:bg-red-500"
          >
            Ouvrir le chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
