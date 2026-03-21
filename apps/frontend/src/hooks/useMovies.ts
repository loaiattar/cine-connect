import { useQuery } from "@tanstack/react-query";
import type { Movie } from "@cine-connect/shared";
import {
  moviesService,
  type SearchMoviesOptions,
  type SearchResponse,
  type TrendingResponse,
} from "@/service/movies.service";

/** Trending list item shape (for useMovieList). */
export type TrendingMovieItem = NonNullable<TrendingResponse["results"]>[number];

export interface UseMovieListReturn {
  data: TrendingMovieItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches trending movies (home list). Uses React Query for cache and loading/error state.
 */
export function useMovieList(): UseMovieListReturn {
  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["movies", "trending"],
    queryFn: () => moviesService.getTrending(),
  });

  const list = response?.results ?? [];

  return {
    data: list,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
  };
}

export interface UseMovieDetailReturn {
  data: Movie | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches a single movie by id (TMDB movie id). Disabled when movieId is invalid.
 */
export function useMovieDetail(movieId: number): UseMovieDetailReturn {
  const enabled = Number.isInteger(movieId) && movieId > 0;
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => moviesService.getMovieById(movieId),
    enabled,
  });

  return {
    data,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
  };
}

export interface UseMovieSearchOptions extends SearchMoviesOptions {
  enabled?: boolean;
}

export interface UseMovieSearchReturn {
  data: SearchResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Searches movies by query with optional page and genre. Set enabled: false to skip (e.g. empty query).
 */
export function useMovieSearch(
  query: string,
  options?: UseMovieSearchOptions
): UseMovieSearchReturn {
  const trimmed = query.trim();
  const { page, genre, enabled = true } = options ?? {};
  const shouldRun = enabled && trimmed.length > 0;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["movies", "search", trimmed, page, genre],
    queryFn: () => moviesService.searchMovies(trimmed, { page, genre }),
    enabled: shouldRun,
  });

  return {
    data,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
  };
}
