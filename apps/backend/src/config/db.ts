import { existsSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

/**
 * Validates that required environment variables for DB are set.
 * Call early at bootstrap (e.g. in index.ts after dotenv.config()).
 */
export function validateEnv(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
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
