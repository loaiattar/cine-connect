/** TMDB API movie response (minimal shape used by backend) */
export interface TmdbMovie {
  id: number;
  title?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
  [key: string]: unknown;
}

/** Favorite toggle result */
export interface FavoriteAction {
  action: 'added' | 'removed';
  movieId: number;
}

/** Watchlist toggle/delete result */
export interface WatchlistAction {
  action: 'added' | 'removed' | 'not_found';
  movieId: number;
}

/** Comment action result */
export interface CommentAction {
  action: 'removed' | 'updated' | 'not_found' | 'unauthorized';
}

/** Movie with user-specific flags and comments (detailed view) */
export interface DetailedMovie extends TmdbMovie {
  isFavorite: boolean;
  isOnWatchlist: boolean;
  comments: MovieCommentRow[];
}

/** Comment row as returned from DB (e.g. with optional user join) */
export interface MovieCommentRow {
  id: number;
  userId: number;
  externalMovieId: number;
  comment: string;
  createdAt: Date | null;
}
