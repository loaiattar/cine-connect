import axios from 'axios';
import { badGateway, notFound } from '../utils';

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = process.env.OMDB_BASE_URL ?? 'https://www.omdbapi.com';

const omdbClient = axios.create({ baseURL: OMDB_BASE_URL });

/** Full movie detail returned by OMDb (?t= or ?i=) */
export interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  BoxOffice: string;
  Response: string;
}

/** Single result item returned by OMDb search (?s=) */
export interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbSearchResponse {
  Search: OmdbSearchItem[];
  totalResults: string;
  Response: string;
}

function handleOmdbError(error: unknown, context: string): never {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      console.error(`${context}: OMDb returned 401 — check OMDB_API_KEY in .env.`);
      throw badGateway('OMDb API key invalid or missing. Set a valid OMDB_API_KEY in .env.');
    }
  }
  console.error(`${context}:`, error);
  throw badGateway('Failed to fetch from OMDb');
}

export const OmdbService = {
  /** Search movies by title — returns a list (?s=title) */
  async searchByTitle(title: string, page = 1): Promise<OmdbSearchResponse> {
    try {
      const response = await omdbClient.get('/', {
        params: { s: title, page, type: 'movie', apikey: OMDB_API_KEY },
      });
      const data = response.data as OmdbSearchResponse & { Error?: string };
      if (data.Response === 'False') {
        throw notFound(data.Error ?? 'No results found');
      }
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) || (error as { status?: number }).status === 404) throw error;
      handleOmdbError(error, `Error searching OMDb for "${title}"`);
    }
  },

  /** Get full movie details by IMDB ID (?i=tt...) */
  async getByImdbId(imdbId: string): Promise<OmdbMovie> {
    try {
      const response = await omdbClient.get('/', {
        params: { i: imdbId, plot: 'full', apikey: OMDB_API_KEY },
      });
      const data = response.data as OmdbMovie & { Error?: string };
      if (data.Response === 'False') {
        throw notFound(data.Error ?? 'Movie not found');
      }
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) || (error as { status?: number }).status === 404) throw error;
      handleOmdbError(error, `Error fetching OMDb movie ${imdbId}`);
    }
  },

  /** Get full movie details by exact title (?t=title) */
  async getByTitle(title: string): Promise<OmdbMovie> {
    try {
      const response = await omdbClient.get('/', {
        params: { t: title, plot: 'full', apikey: OMDB_API_KEY },
      });
      const data = response.data as OmdbMovie & { Error?: string };
      if (data.Response === 'False') {
        throw notFound(data.Error ?? 'Movie not found');
      }
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) || (error as { status?: number }).status === 404) throw error;
      handleOmdbError(error, `Error fetching OMDb movie "${title}"`);
    }
  },
};
