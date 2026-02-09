import { apiClient } from "../lib/api-client";

export interface Movie {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    trailerUrl: string;
    releaseDate: string;
    genre: string;
    rating: number;
    duration: number;
    isFeatured: boolean;
}

export const moviesService = {
    getMovies: () => apiClient.get<Movie[]>('/movies'),
    getMovieById: (id: number) => apiClient.get<Movie>(`/movies/${id}`),
    createMovie: (movie: Movie) => apiClient.post<Movie>('/movies', movie),
    updateMovie: (id: number, movie: Movie) => apiClient.put<Movie>(`/movies/${id}`, movie),
    deleteMovie: (id: number) => apiClient.delete<Movie>(`/movies/${id}`),
};