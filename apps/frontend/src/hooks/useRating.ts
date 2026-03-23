import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDisplayApiError, useQueryDisplayError } from "@/hooks/useNormalizedApiError";
import { useCallback } from "react";
import {
  moviesService,
  type MovieRatingResponse,
} from "@/service/movies.service";

function normalizeRating(raw: MovieRatingResponse | undefined): MovieRatingResponse | null {
  if (raw == null) return null;
  if (typeof raw === "object" && "average" in raw && "count" in raw) return raw;
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
  const submitError = useDisplayApiError(submitMutation.error);
  const queryError = useQueryDisplayError(isError, error);

  return {
    rating,
    isLoading,
    isError,
    error: queryError,
    refetch,
    setRating,
    isSubmitting: submitMutation.isPending,
    submitError,
  };
}
