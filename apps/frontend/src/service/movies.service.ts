import type { Movie } from "@cine-connect/shared";
import { apiClient } from "../lib/api-client";

export type { Movie };

export const moviesService = {
    getMovies: () => apiClient.get<Movie[]>("/api/movies"),
    getMovieById: (id: number) => apiClient.get<Movie>(`/api/movies/${id}`),
    createMovie: (movie: Movie) => apiClient.post<Movie>("/api/movies", movie),
    updateMovie: (id: number, movie: Movie) => apiClient.put<Movie>(`/api/movies/${id}`, movie),
    deleteMovie: (id: number) => apiClient.delete<Movie>(`/api/movies/${id}`),
};