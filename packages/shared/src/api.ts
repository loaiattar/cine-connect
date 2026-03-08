export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Genre {
    id: number;
    name: string;
}

/** TMDB movie genre list (ids match backend search filter and TMDB API). */
export const MOVIE_GENRES: Genre[] = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
];

export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    genres?: Genre[];
    isFavorite?: boolean;
}

export interface Comment {
    id: number;
    userId: number;
    externalMovieId: number;
    comment: string;
    createdAt: Date | string;
    user?: Partial<User>;
}

export interface ToggleFavoriteRequest {
    userId: number;
    movieId: number;
}

export interface WatchlistRequest {
    userId: number;
    movieId: number;
}

export interface CommentRequest {
    userId: number;
    movieId: number;
    comment: string;
}

export interface UpdateCommentRequest extends CommentRequest {
    commentId: number;
}