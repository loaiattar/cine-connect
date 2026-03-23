import type { Movie } from "@cine-connect/shared";
import { getMovieImageUrl } from "./utils";

/**
 * Display shape used by MovieHero, movie detail route, and cards.
 * Derived from API Movie (TMDB-shaped) so the UI can stay stable.
 */
export interface MovieDisplay {
  title: string;
  year: number;
  director: string;
  genres: string[];
  rating: number;
  posterUrl: string;
  synopsis: string;
}

/**
 * Maps API movie (shared Movie / TMDB shape) to the display shape expected by UI components.
 * Handles missing fields (e.g. director not in TMDB main response, genres as ids vs names).
 */
export function apiMovieToDisplay(movie: Movie): MovieDisplay {
  const releaseDate = movie.release_date ?? "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 0;
  const genreNames = movie.genres?.map((g) => g.name) ?? [];

  return {
    title: movie.title ?? "",
    year: Number.isNaN(year) ? 0 : year,
    director: (movie as unknown as Record<string, string>).director ?? "—",
    genres: genreNames,
    rating: typeof movie.vote_average === "number" ? movie.vote_average : 0,
    posterUrl: getMovieImageUrl(movie.poster_path ?? ""),
    synopsis: movie.overview ?? "",
  };
}
