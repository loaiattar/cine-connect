import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  moviesService,
  type MovieCommentRow,
} from "@/service/movies.service";

function normalizeComments(raw: unknown): MovieCommentRow[] {
  if (Array.isArray(raw)) return raw as MovieCommentRow[];
  if (raw != null && typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    return Array.isArray(d) ? (d as MovieCommentRow[]) : [];
  }
  return [];
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
  const addError =
    addMutation.error instanceof Error
      ? addMutation.error
      : addMutation.error != null && typeof addMutation.error === "object" && "message" in addMutation.error
        ? new Error(String((addMutation.error as { message: string }).message))
        : addMutation.error != null
          ? new Error(String(addMutation.error))
          : null;

  return {
    comments,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
    addComment,
    isSubmitting: addMutation.isPending,
    addError,
  };
}
