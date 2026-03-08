import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  moviesService,
  type FavoriteEntry,
} from "@/service/movies.service";
import { useAuth } from "@/hooks/useAuth";

function normalizeFavorites(raw: unknown): FavoriteEntry[] {
  if (Array.isArray(raw)) return raw;
  if (raw != null && typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    return Array.isArray(d) ? (d as FavoriteEntry[]) : [];
  }
  return [];
}

export interface UseFavoritesReturn {
  favorites: FavoriteEntry[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  toggleFavorite: (movieId: number) => void;
  addFavorite: (movieId: number) => void;
  removeFavorite: (movieId: number) => void;
  isToggling: boolean;
}

/**
 * Fetches the current user's favorites and exposes add/remove/toggle actions.
 * Syncs with the backend; invalidates cache after toggle so list stays in sync.
 */
export function useFavorites(): UseFavoritesReturn {
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
    queryKey: ["favorites", userId],
    queryFn: () => moviesService.getFavorites(userId!),
    enabled: userId != null,
  });

  const toggleMutation = useMutation({
    mutationFn: (movieId: number) => moviesService.toggleFavorite(movieId),
    onSuccess: () => {
      if (userId != null) {
        queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
      }
    },
  });

  const toggleFavorite = useCallback(
    (movieId: number) => {
      toggleMutation.mutate(movieId);
    },
    [toggleMutation]
  );

  const addFavorite = useCallback(
    (movieId: number) => {
      toggleMutation.mutate(movieId);
    },
    [toggleMutation]
  );

  const removeFavorite = useCallback(
    (movieId: number) => {
      toggleMutation.mutate(movieId);
    },
    [toggleMutation]
  );

  const favorites = normalizeFavorites(rawData);

  return {
    favorites,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isToggling: toggleMutation.isPending,
  };
}
