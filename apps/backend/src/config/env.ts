const PRODUCTION_JWT_SECRET_MIN_LENGTH = 32;

/**
 * Validates required environment variables.
 * Call from bootstrap (e.g. index.ts after dotenv.config()) before accepting traffic.
 * - DATABASE_URL: always required.
 * - JWT_SECRET: always required (tests: apps/backend/.env.test). No hardcoded fallback.
 * - TMDB_API_KEY: required when NODE_ENV is not "test".
 */
export function validateEnv(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (!process.env.JWT_SECRET?.trim()) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.JWT_SECRET.length < PRODUCTION_JWT_SECRET_MIN_LENGTH
  ) {
    throw new Error(
      `JWT_SECRET must be at least ${PRODUCTION_JWT_SECRET_MIN_LENGTH} characters in production`
    );
  }

  if (process.env.NODE_ENV === 'test') {
    return;
  }

  if (!process.env.TMDB_API_KEY?.trim()) {
    throw new Error(
      'TMDB_API_KEY environment variable is required when NODE_ENV is not "test" (movie routes depend on it)'
    );
  }
}

/** Use instead of reading process.env.JWT_SECRET directly. */
export function getJwtSecret(): string {
  return process.env.JWT_SECRET!.trim();
}
