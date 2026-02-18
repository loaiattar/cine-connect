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