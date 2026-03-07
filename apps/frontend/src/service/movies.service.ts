import type { ApiResponse } from "@cine-connect/shared";
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

/** GET /api/movies/rating/:movieId response */
export interface MovieRatingResponse {
    average: number;
    count: number;
    userRating?: number | null;
}

/** POST /api/movies/rate body & response */
export interface SubmitRatingPayload {
    movieId: number;
    rating: number;
}

/** GET /api/movies/comments/:movieId — single comment with optional user info */
export interface MovieCommentRow {
    id: number;
    userId: number | null;
    externalMovieId: number;
    comment: string;
    createdAt: string | null;
    userEmail?: string | null;
    userName?: string | null;
}

/** TMDB trending response shape */
export interface TrendingResponse {
    results?: Array<{
        id: number;
        title?: string;
        release_date?: string;
        poster_path?: string | null;
        vote_average?: number;
        genre_ids?: number[];
    }>;
}

/** GET /api/movies/search — paginated search results (matches backend shape) */
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
    getMovies: () => apiClient.get<Movie[]>("/api/movies"),
    getMovieById: (id: number) => apiClient.get<Movie>(`/api/movies/${id}`),
    getMovieRating: (movieId: number) =>
        apiClient.get<MovieRatingResponse>(`/api/movies/rating/${movieId}`),
    submitRating: (movieId: number, rating: number) =>
        apiClient.post<SubmitRatingPayload>("/api/movies/rate", { movieId, rating }),
    getMovieComments: (movieId: number) =>
        apiClient.get<MovieCommentRow[]>(`/api/movies/comments/${movieId}`),
    addComment: (movieId: number, comment: string) =>
        apiClient.post<MovieCommentRow>("/api/movies/comments", { movieId, comment }),
    getTrending: () => apiClient.get<TrendingResponse>("/api/movies/trending"),
    searchMovies: (query: string, options?: SearchMoviesOptions) => {
        const params = new URLSearchParams();
        params.set("q", query.trim());
        if (options?.page != null) params.set("page", String(options.page));
        if (options?.genre != null) params.set("genre", String(options.genre));
        return apiClient.get<SearchResponse>(`/api/movies/search?${params.toString()}`);
    },
    getGenres: (): Promise<ApiResponse<Genre[]>> =>
        Promise.resolve({ data: [...MOVIE_GENRES], success: true }),
    getFavorites: (userId: number) =>
        apiClient.get<FavoriteEntry[]>(`/api/movies/favorites/${userId}`),
    createMovie: (movie: Movie) => apiClient.post<Movie>("/api/movies", movie),
    updateMovie: (id: number, movie: Movie) => apiClient.put<Movie>(`/api/movies/${id}`, movie),
    deleteMovie: (id: number) => apiClient.delete<Movie>(`/api/movies/${id}`),
};