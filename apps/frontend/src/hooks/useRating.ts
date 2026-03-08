import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  moviesService,
  type MovieRatingResponse,
} from "@/service/movies.service";

function normalizeRating(raw: unknown): MovieRatingResponse | null {
  if (raw == null) return null;
  if (typeof raw === "object" && "average" in raw && "count" in raw) {
    return raw as MovieRatingResponse;
  }
  if (typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    return d != null && typeof d === "object" && "average" in d
      ? (d as MovieRatingResponse)
      : null;
  }
  return null;
}

export interface UseRatingReturn {
  rating: MovieRatingResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  setRating: (rating: number) => void;
  isSubmitting: boolean;
  submitError: Error | null;
}

/**
 * Fetches aggregate and user rating for a movie and exposes setRating.
 * Invalidates and refetches after submit so data stays in sync with the backend.
 */
export function useRating(movieId: number): UseRatingReturn {
  const queryClient = useQueryClient();
  const enabled = Number.isInteger(movieId) && movieId > 0;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["movie", "rating", movieId],
    queryFn: () => moviesService.getMovieRating(movieId),
    enabled,
  });

  const submitMutation = useMutation({
    mutationFn: (rating: number) => moviesService.submitRating(movieId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie", "rating", movieId] });
    },
  });

  const setRating = useCallback(
    (rating: number) => {
      const value = Math.min(10, Math.max(1, Math.round(rating)));
      submitMutation.mutate(value);
    },
    [submitMutation]
  );

  const rating = normalizeRating(rawData);
  const submitError =
    submitMutation.error instanceof Error
      ? submitMutation.error
      : submitMutation.error != null && typeof submitMutation.error === "object" && "message" in submitMutation.error
        ? new Error(String((submitMutation.error as { message: string }).message))
        : submitMutation.error != null
          ? new Error(String(submitMutation.error))
          : null;

  return {
    rating,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
    setRating,
    isSubmitting: submitMutation.isPending,
    submitError,
  };
}
