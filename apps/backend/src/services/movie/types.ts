/** Paginated movie list shape (TMDB search/trending style) */
export interface PaginatedMovies {
  page: number;
  results: Array<{ genre_ids?: number[]; [key: string]: unknown }>;
  total_pages: number;
  total_results: number;
}
