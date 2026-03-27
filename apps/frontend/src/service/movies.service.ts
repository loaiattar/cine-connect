import type { Genre, Movie } from "@cine-connect/shared";
import { MOVIE_GENRES } from "@cine-connect/shared";
import { apiClient } from "../lib/api-client";

export type { Movie };
export type { Genre };

export interface FavoriteEntry {
    id: number;
    userId: number | null;
    externalMovieId: number;
    addedAt: string | null;
}

/** POST /api/v1/movies/favorite — toggle add/remove; response shape */
export interface ToggleFavoriteResponse {
    action: "added" | "removed";
    movieId: number;
}

export interface WatchlistEntry {
    id: number;
    userId: number | null;
    externalMovieId: number;
    createdAt?: string | null;
}

/** POST /api/v1/movies/watchlist — toggle add/remove; response shape */
export interface ToggleWatchlistResponse {
    action: "added" | "removed";
    movieId: number;
}

/** GET /api/v1/movies/rating/:movieId response */
export interface MovieRatingResponse {
    average: number;
    count: number;
    userRating?: number | null;
}

/** POST /api/v1/movies/rate body & response */
export interface SubmitRatingPayload {
    movieId: number;
    rating: number;
}

/** GET /api/v1/movies/comments/:movieId — single comment with optional user info */
export interface MovieCommentRow {
    id: number;
    userId: number | null;
    externalMovieId: number;
    comment: string;
    createdAt: string | null;
    userEmail?: string | null;
    userName?: string | null;
}

/** TMDB trending / discover list shape */
export interface TrendingResponse {
    page?: number;
    total_pages?: number;
    total_results?: number;
    results?: Array<{
        id: number;
        title?: string;
        release_date?: string;
        poster_path?: string | null;
        vote_average?: number;
        genre_ids?: number[];
    }>;
}

/** GET /api/v1/movies/search — paginated search results (matches backend shape) */
export interface SearchResultItem {
    id: number;
    title?: string;
    overview?: string;
    poster_path?: string | null;
    release_date?: string;
    vote_average?: number;
    genre_ids?: number[];
}

export interface SearchResponse {
    page: number;
    results: SearchResultItem[];
    total_pages: number;
    total_results: number;
}

export interface SearchMoviesOptions {
    page?: number;
    genre?: number;
}

export const moviesService = {
    getMovies: () => apiClient.get<Movie[]>("/api/v1/movies"),
    getMovieById: (id: number) => apiClient.get<Movie>(`/api/v1/movies/${id}`),
    getMovieRating: (movieId: number) =>
        apiClient.get<MovieRatingResponse>(`/api/v1/movies/rating/${movieId}`),
    submitRating: (movieId: number, rating: number) =>
        apiClient.post<SubmitRatingPayload>("/api/v1/movies/rate", { movieId, rating }),
    getMovieComments: (movieId: number) =>
        apiClient.get<MovieCommentRow[]>(`/api/v1/movies/comments/${movieId}`),
    addComment: (movieId: number, comment: string) =>
        apiClient.post<MovieCommentRow>("/api/v1/movies/comments", { movieId, comment }),
    getTrending: (page = 1) =>
        apiClient.get<TrendingResponse>(`/api/v1/movies/trending?page=${page}`),
    getTopRated: (page = 1) =>
        apiClient.get<SearchResponse>(`/api/v1/movies/top-rated?page=${page}`),
    discoverByGenre: (genreId: number, page = 1) =>
        apiClient.get<SearchResponse>(
            `/api/v1/movies/discover?genre=${encodeURIComponent(String(genreId))}&page=${page}`
        ),
    searchMovies: (query: string, options?: SearchMoviesOptions) => {
        const params = new URLSearchParams();
        params.set("q", query.trim());
        if (options?.page != null) params.set("page", String(options.page));
        if (options?.genre != null) params.set("genre", String(options.genre));
        return apiClient.get<SearchResponse>(`/api/v1/movies/search?${params.toString()}`);
    },
    getGenres: (): Promise<Genre[]> => Promise.resolve([...MOVIE_GENRES]),
    getFavorites: (userId: number) =>
        apiClient.get<FavoriteEntry[]>(`/api/v1/movies/favorites/${userId}`),
    toggleFavorite: (movieId: number) =>
        apiClient.post<ToggleFavoriteResponse>("/api/v1/movies/favorite", { movieId }),
    getWatchlist: (userId: number) =>
        apiClient.get<WatchlistEntry[]>(`/api/v1/movies/watchlist/${userId}`),
    toggleWatchlist: (movieId: number) =>
        apiClient.post<ToggleWatchlistResponse>("/api/v1/movies/watchlist", { movieId }),
    removeFromWatchlist: (movieId: number) =>
        apiClient.delete<{ action: string; movieId: number }>(`/api/v1/movies/watchlist/${movieId}`),
    createMovie: (movie: Movie) => apiClient.post<Movie>("/api/v1/movies", movie),
    updateMovie: (id: number, movie: Movie) => apiClient.put<Movie>(`/api/v1/movies/${id}`, movie),
    deleteMovie: (id: number) => apiClient.delete<Movie>(`/api/v1/movies/${id}`),
};