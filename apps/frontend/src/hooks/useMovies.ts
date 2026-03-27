import { useQuery } from "@tanstack/react-query";
import { useQueryDisplayError } from "@/hooks/useNormalizedApiError";
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
  const queryError = useQueryDisplayError(isError, error);

  return {
    data: list,
    isLoading,
    isError,
    error: queryError,
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

  const detailQueryError = useQueryDisplayError(isError, error);

  return {
    data,
    isLoading,
    isError,
    error: detailQueryError,
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
  const page = options?.page ?? 1;
  const { genre, enabled = true } = options ?? {};
  const shouldRun = enabled && trimmed.length > 0;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["movies", "search", trimmed, page, genre],
    queryFn: () => moviesService.searchMovies(trimmed, { page, genre }),
    enabled: shouldRun,
  });

  const searchQueryError = useQueryDisplayError(isError, error);

  return {
    data,
    isLoading,
    isError,
    error: searchQueryError,
    refetch,
  };
}

export type MovieBrowseKind = "trending" | "top_rated" | "discover";

export function useMovieBrowse(
  kind: MovieBrowseKind | null,
  options: { genreId?: number; page: number }
): UseMovieSearchReturn {
  const { genreId, page } = options;
  const enabled =
    kind === "trending" ||
    kind === "top_rated" ||
    (kind === "discover" && genreId != null && genreId > 0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["movies", "browse", kind, genreId ?? 0, page],
    queryFn: async () => {
      if (kind === "trending") return moviesService.getTrending(page);
      if (kind === "top_rated") return moviesService.getTopRated(page);
      if (kind === "discover" && genreId != null) {
        return moviesService.discoverByGenre(genreId, page);
      }
      throw new Error("Invalid browse mode");
    },
    enabled,
  });

  const browseError = useQueryDisplayError(isError, error);

  return {
    data: data as SearchResponse | undefined,
    isLoading,
    isError,
    error: browseError,
    refetch,
  };
}
