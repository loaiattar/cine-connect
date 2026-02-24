import { existsSync } from 'node:fs';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

dotenv.config();

const TEST_JWT_SECRET = 'fixed_test_secret_123';

/**
 * Validates that required environment variables are set.
 * Call early at bootstrap (e.g. in index.ts after dotenv.config()).
 * - DATABASE_URL: always required.
 * - JWT_SECRET: required when NODE_ENV is not "test"; in production must not be the test value.
 * - TMDB_API_KEY: required when NODE_ENV is not "test" (movie/TMDB routes depend on it).
 */
export function validateEnv(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (process.env.NODE_ENV === 'test') {
    return; // JWT_SECRET and TMDB_API_KEY fallbacks / optional in test
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    throw new Error(
      'JWT_SECRET environment variable is required when NODE_ENV is not "test"'
    );
  }

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.JWT_SECRET === TEST_JWT_SECRET
  ) {
    throw new Error(
      'JWT_SECRET must not be the test value in production. Set a strong secret in production.'
    );
  }

  if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY.trim() === '') {
    throw new Error(
      'TMDB_API_KEY environment variable is required when NODE_ENV is not "test" (movie routes depend on it)'
    );
  }
}

/**
 * Returns the JWT secret. Use this instead of process.env.JWT_SECRET.
 * In test, falls back to a fixed value so tests can run without setting JWT_SECRET.
 * Otherwise returns the validated JWT_SECRET (validateEnv must have been called at startup).
 */
export function getJwtSecret(): string {
  if (process.env.NODE_ENV === 'test') {
    return process.env.JWT_SECRET || TEST_JWT_SECRET;
  }
  return process.env.JWT_SECRET!;
}

function getConnectionString(): string {
  validateEnv();
  let connectionString = process.env.DATABASE_URL!;
  const isDocker =
    process.env.IS_DOCKER === 'true' || existsSync('/.dockerenv');
  if (isDocker) {
    connectionString = connectionString.replace('localhost', 'cine-db');
  }
  return connectionString;
}

const client = postgres(getConnectionString());
export const db = drizzle(client, { schema });
