import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useQueryDisplayError } from "@/hooks/useNormalizedApiError";
import {
  moviesService,
  type FavoriteEntry,
} from "@/service/movies.service";
import { useAuth } from "@/hooks/useAuth";

function normalizeFavorites(raw: FavoriteEntry[] | undefined): FavoriteEntry[] {
  return Array.isArray(raw) ? raw : [];
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
  const queryError = useQueryDisplayError(isError, error);

  return {
    favorites,
    isLoading,
    isError,
    error: queryError,
    refetch,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isToggling: toggleMutation.isPending,
  };
}
