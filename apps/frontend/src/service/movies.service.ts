import type { Movie } from "@cine-connect/shared";
import { apiClient } from "../lib/api-client";

export type { Movie };

export interface FavoriteEntry {
    id: number;
    userId: number | null;
    externalMovieId: number;
    addedAt: string | null;
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
    getTrending: () => apiClient.get<TrendingResponse>("/api/movies/trending"),
    getFavorites: (userId: number) =>
        apiClient.get<FavoriteEntry[]>(`/api/movies/favorites/${userId}`),
    createMovie: (movie: Movie) => apiClient.post<Movie>("/api/movies", movie),
    updateMovie: (id: number, movie: Movie) => apiClient.put<Movie>(`/api/movies/${id}`, movie),
    deleteMovie: (id: number) => apiClient.delete<Movie>(`/api/movies/${id}`),
};