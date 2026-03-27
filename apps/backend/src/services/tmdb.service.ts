import axios from 'axios';
import { badGateway, notFound } from '../utils';
import { logger } from '../logger';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

function handleTmdbError(error: unknown, context: string): never {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      throw notFound('Movie not found');
    }
    if (error.response?.status === 401) {
      logger.error(
        { context, status: 401 },
        'TMDB returned 401 — check TMDB_API_KEY is set and valid.'
      );
      throw badGateway('Movie database API key invalid or missing. Set a valid TMDB_API_KEY in .env.');
    }
  }
  logger.error({ context, err: error }, 'TMDB request failed');
  throw badGateway('Failed to fetch from movie database');
}

export const TmdbService = {
  async getMovieDetails(movieId: number) {
    try {
      const response = await tmdbClient.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      handleTmdbError(error, `Error fetching movie ${movieId}`);
    }
  },

  async searchMovies(query: string, page = 1) {
    try {
      const response = await tmdbClient.get('/search/movie', {
        params: { query, page },
      });
      return response.data;
    } catch (error) {
      handleTmdbError(error, 'Error searching movies');
    }
  },

  async getTrendingMovies(page = 1) {
    try {
      const response = await tmdbClient.get('/trending/movie/day', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      handleTmdbError(error, 'Error fetching trending movies');
    }
  },

  async getTopRatedMovies(page = 1) {
    try {
      const response = await tmdbClient.get('/movie/top_rated', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      handleTmdbError(error, 'Error fetching top rated movies');
    }
  },

  async discoverMoviesByGenre(genreId: number, page = 1) {
    try {
      const response = await tmdbClient.get('/discover/movie', {
        params: { page, with_genres: genreId },
      });
      return response.data;
    } catch (error) {
      handleTmdbError(error, 'Error fetching discover movies');
    }
  },

  async getRecommendations(movieId: number) {
    try {
      const response = await tmdbClient.get(`/movie/${movieId}/recommendations`);
      return response.data;
    } catch (error) {
      handleTmdbError(error, `Error fetching recommendations for ${movieId}`);
    }
  }
};