import { db } from "../../db";
import { favorites, watchlists } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { TmdbService } from "../tmdb.service";
import type { PaginatedMovies } from "./types";
import { MovieCommentsService } from "./movie-comments.service";
import { logger } from "../../logger";

export const MovieCatalogService = {
  async getTrending() {
    return TmdbService.getTrendingMovies();
  },

  async searchMovies(
    query: string,
    page: number,
    genre?: number
  ): Promise<PaginatedMovies> {
    const data = await TmdbService.searchMovies(query, page);
    const result: PaginatedMovies = {
      page: data.page ?? page,
      results: data.results ?? [],
      total_pages: data.total_pages ?? 0,
      total_results: data.total_results ?? 0,
    };
    if (genre != null && result.results.length > 0) {
      const filtered = result.results.filter(
        (m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(genre)
      );
      result.results = filtered;
      result.total_results = filtered.length;
    }
    return result;
  },

  async getMovieById(movieId: number, _userId?: number) {
    return TmdbService.getMovieDetails(movieId);
  },

  async getDetailedMovie(movieId: number, userId?: number) {
    const movieData = await TmdbService.getMovieDetails(movieId);
    let isFavorite = false;
    let isOnWatchlist = false;
    let movieComments: Awaited<
      ReturnType<typeof MovieCommentsService.getMovieComments>
    > = [];

    try {
      if (userId) {
        const [favorite] = await db
          .select()
          .from(favorites)
          .where(
            and(
              eq(favorites.userId, userId),
              eq(favorites.externalMovieId, movieId)
            )
          )
          .limit(1);
        isFavorite = !!favorite;

        const [watchlist] = await db
          .select()
          .from(watchlists)
          .where(
            and(
              eq(watchlists.userId, userId),
              eq(watchlists.externalMovieId, movieId)
            )
          )
          .limit(1);
        isOnWatchlist = !!watchlist;
      }
      movieComments = await MovieCommentsService.getMovieComments(movieId);
    } catch (err) {
      logger.warn(
        { err, movieId, userId },
        "Database unavailable for getDetailedMovie, returning TMDB data only"
      );
    }

    return {
      ...movieData,
      isFavorite,
      isOnWatchlist,
      comments: movieComments,
    };
  },
};
