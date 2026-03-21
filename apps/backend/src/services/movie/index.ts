import { MovieCatalogService } from "./movie-catalog.service";
import { MovieCommentsService } from "./movie-comments.service";
import { MovieFavoritesService } from "./movie-favorites.service";
import { MovieRatingsService } from "./movie-ratings.service";
import { MovieWatchlistService } from "./movie-watchlist.service";

export type { PaginatedMovies } from "./types";

export {
  MovieCatalogService,
  MovieCommentsService,
  MovieFavoritesService,
  MovieRatingsService,
  MovieWatchlistService,
};

/** Facade preserving the original `MovieService` API for controllers and tests. */
export const MovieService = {
  ...MovieCatalogService,
  ...MovieFavoritesService,
  ...MovieWatchlistService,
  ...MovieCommentsService,
  ...MovieRatingsService,
};
