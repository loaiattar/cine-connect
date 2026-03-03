import type { Movie } from "@cine-connect/shared";
import { apiClient } from "../lib/api-client";

export type { Movie };

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
    getFavorites: (userId: number) =>
        apiClient.get<FavoriteEntry[]>(`/api/movies/favorites/${userId}`),
    createMovie: (movie: Movie) => apiClient.post<Movie>("/api/movies", movie),
    updateMovie: (id: number, movie: Movie) => apiClient.put<Movie>(`/api/movies/${id}`, movie),
    deleteMovie: (id: number) => apiClient.delete<Movie>(`/api/movies/${id}`),
};