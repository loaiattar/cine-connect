import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let connectionString = process.env.DATABASE_URL || "postgres://admin:password123@localhost:5432/cineconnect";

const isDocker = process.env.IS_DOCKER === 'true' || require('fs').existsSync('/.dockerenv');

if (isDocker) {
  connectionString = connectionString.replace('localhost', 'cine-db');
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });