import { useQuery } from "@tanstack/react-query";
import type { Movie } from "@cine-connect/shared";
import {
  moviesService,
  type SearchMoviesOptions,
  type SearchResponse,
  type TrendingResponse,
} from "@/service/movies.service";

/** Unwrap backend response (raw payload or ApiResponse envelope). */
function unwrapData<T>(raw: unknown, hasDataKey: (r: unknown) => r is { data: T }): T | undefined {
  if (raw == null) return undefined;
  if (hasDataKey(raw)) return raw.data;
  return raw as T; // backend often returns payload directly
}

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
  const { data: raw, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["movies", "trending"],
    queryFn: () => moviesService.getTrending(),
  });

  const response = unwrapData<TrendingResponse>(
    raw,
    (r): r is { data: TrendingResponse } =>
      typeof r === "object" && r !== null && "data" in r && typeof (r as { data: unknown }).data === "object"
  );
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
  const { data: raw, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => moviesService.getMovieById(movieId),
    enabled,
  });

  const data =
    unwrapData<Movie>(
      raw,
      (r): r is { data: Movie } =>
        typeof r === "object" && r !== null && "data" in r
    ) ?? (raw as Movie | undefined);

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

  const { data: raw, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["movies", "search", trimmed, page, genre],
    queryFn: () => moviesService.searchMovies(trimmed, { page, genre }),
    enabled: shouldRun,
  });

  const response = unwrapData<SearchResponse>(
    raw,
    (r): r is { data: SearchResponse } =>
      typeof r === "object" && r !== null && "data" in r
  );
  const data = response ?? (raw as SearchResponse | undefined);

  return {
    data,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
  };
}
