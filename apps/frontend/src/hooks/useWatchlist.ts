import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  moviesService,
  type WatchlistEntry,
} from "@/service/movies.service";
import { useAuth } from "@/hooks/useAuth";

function normalizeWatchlist(raw: unknown): WatchlistEntry[] {
  if (Array.isArray(raw)) return raw;
  if (raw != null && typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    return Array.isArray(d) ? (d as WatchlistEntry[]) : [];
  }
  return [];
}

export interface UseWatchlistReturn {
  watchlist: WatchlistEntry[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  toggleWatchlist: (movieId: number) => void;
  addToWatchlist: (movieId: number) => void;
  removeFromWatchlist: (movieId: number) => void;
  isToggling: boolean;
}

/**
 * Fetches the current user's watchlist and exposes add/remove/toggle actions.
 * Syncs with the backend; invalidates cache after mutations so list stays in sync.
 */
export function useWatchlist(): UseWatchlistReturn {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.userId ?? null;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["watchlist", userId],
    queryFn: () => moviesService.getWatchlist(userId!),
    enabled: userId != null,
  });

  const toggleMutation = useMutation({
    mutationFn: (movieId: number) => moviesService.toggleWatchlist(movieId),
    onSuccess: () => {
      if (userId != null) {
        queryClient.invalidateQueries({ queryKey: ["watchlist", userId] });
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: (movieId: number) => moviesService.removeFromWatchlist(movieId),
    onSuccess: () => {
      if (userId != null) {
        queryClient.invalidateQueries({ queryKey: ["watchlist", userId] });
      }
    },
  });

  const toggleWatchlist = useCallback(
    (movieId: number) => {
      toggleMutation.mutate(movieId);
    },
    [toggleMutation]
  );

  const addToWatchlist = useCallback(
    (movieId: number) => {
      toggleMutation.mutate(movieId);
    },
    [toggleMutation]
  );

  const removeFromWatchlist = useCallback(
    (movieId: number) => {
      removeMutation.mutate(movieId);
    },
    [removeMutation]
  );

  const watchlist = normalizeWatchlist(rawData);
  const isToggling = toggleMutation.isPending || removeMutation.isPending;

  return {
    watchlist,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
    toggleWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isToggling,
  };
}
