import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDisplayApiError, useQueryDisplayError } from "@/hooks/useNormalizedApiError";
import {
  moviesService,
  type MovieCommentRow,
} from "@/service/movies.service";

function normalizeComments(raw: MovieCommentRow[] | undefined): MovieCommentRow[] {
  return Array.isArray(raw) ? raw : [];
}

export interface UseCommentsOptions {
  onAddSuccess?: () => void;
}

export interface UseCommentsReturn {
  comments: MovieCommentRow[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  addComment: (text: string) => void;
  isSubmitting: boolean;
  addError: Error | null;
}

/**
 * Fetches comments for a movie and exposes addComment. Invalidates and refetches
 * after submit so the list stays in sync with the backend.
 */
export function useComments(movieId: number, options?: UseCommentsOptions): UseCommentsReturn {
  const queryClient = useQueryClient();
  const onAddSuccess = options?.onAddSuccess;
  const enabled = Number.isInteger(movieId) && movieId > 0;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["movie", "comments", movieId],
    queryFn: () => moviesService.getMovieComments(movieId),
    enabled,
  });

  const addMutation = useMutation({
    mutationFn: (text: string) => moviesService.addComment(movieId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie", "comments", movieId] });
      onAddSuccess?.();
    },
  });

  const addComment = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed) addMutation.mutate(trimmed);
    },
    [addMutation]
  );

  const comments = normalizeComments(rawData);
  const addError = useDisplayApiError(addMutation.error);
  const queryError = useQueryDisplayError(isError, error);

  return {
    comments,
    isLoading,
    isError,
    error: queryError,
    refetch,
    addComment,
    isSubmitting: addMutation.isPending,
    addError,
  };
}
