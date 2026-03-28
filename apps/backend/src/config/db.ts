import { existsSync } from 'node:fs';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

dotenv.config();

const PRODUCTION_JWT_SECRET_MIN_LENGTH = 32;

/**
 * Validates that required environment variables are set.
 * Call early at bootstrap (e.g. in index.ts after dotenv.config()).
 * - DATABASE_URL: always required.
 * - JWT_SECRET: always required (set in apps/backend/.env.test for Vitest). No hardcoded fallback.
 * - TMDB_API_KEY: required when NODE_ENV is not "test" (movie/TMDB routes depend on it).
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

/**
 * Returns the JWT secret. Use this instead of reading process.env.JWT_SECRET directly.
 * validateEnv() must run at startup before any JWT is signed or verified.
 */
export function getJwtSecret(): string {
  return process.env.JWT_SECRET!.trim();
}

function getConnectionString(): string {
  validateEnv();
  let connectionString = process.env.DATABASE_URL!;
  const isDocker =
    process.env.IS_DOCKER === 'true' || existsSync('/.dockerenv');
  // Docker Compose: backend container uses hostname `cine-db`, not localhost.
  // Cloud Run (and similar) also sets IS_DOCKER in the image but must use DATABASE_URL as-is
  // (e.g. Cloud SQL socket); K_SERVICE is set by Cloud Run.
  if (isDocker && !process.env.K_SERVICE) {
    connectionString = connectionString.replace('localhost', 'cine-db');
  }
  return connectionString;
}

const client = postgres(getConnectionString());
export const db = drizzle(client, { schema });

let dbClosed = false;

/** Closes the Postgres pool (postgres.js). Safe to call multiple times. */
export async function closeDatabase(): Promise<void> {
  if (dbClosed) return;
  dbClosed = true;
  await client.end({ timeout: 10 });
}
