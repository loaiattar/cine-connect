import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const TmdbService = {
  async getMovieDetails(movieId: number) {
    try {
      const response = await tmdbClient.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie ${movieId}:`, error);
      throw new Error('Failed to fetch movie details from TMDB');
    }
  },

  async searchMovies(query: string, page = 1) {
    try {
      const response = await tmdbClient.get('/search/movie', {
        params: { query, page },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw new Error('Failed to search movies from TMDB');
    }
  },

  async getTrendingMovies() {
    try {
      const response = await tmdbClient.get('/trending/movie/day');
      return response.data;
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw new Error('Failed to fetch trending movies');
    }
  },

  async getRecommendations(movieId: number) {
    try {
      const response = await tmdbClient.get(`/movie/${movieId}/recommendations`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recommendations for ${movieId}:`, error);
      throw new Error('Failed to fetch recommendations');
    }
  }
};