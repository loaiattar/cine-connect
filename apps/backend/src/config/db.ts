import { existsSync } from 'node:fs';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { validateEnv } from './env';

dotenv.config();

type DrizzleInstance = PostgresJsDatabase<typeof schema>;

let pgClient: postgres.Sql | undefined;
let drizzleDb: DrizzleInstance | undefined;

/**
 * Google Cloud SQL (unix socket) URLs look like:
 *   postgresql://USER:PASSWORD@/DBNAME?host=/cloudsql/PROJECT:REGION:INSTANCE
 * Node's URL parser and postgres.js reject that string (empty host, colons in query).
 * Convert to postgres.js options with an explicit socket path.
 */
function postgresConfigFromDatabaseUrl(
  raw: string
): string | postgres.Options<Record<string, postgres.PostgresType>> {
  let url = raw.trim();
  const isDocker =
    process.env.IS_DOCKER === 'true' || existsSync('/.dockerenv');
  if (isDocker && !process.env.K_SERVICE) {
    url = url.replace('localhost', 'cine-db');
  }

  const m = url.match(
    /^postgres(?:ql)?:\/\/([^:/?#]+):([^@]*?)@\/([^?#]+)(?:\?([^#]*))?$/i
  );
  if (m) {
    const [, userEnc, passwordEnc, database, queryPart] = m;
    const params = new URLSearchParams(
      queryPart?.startsWith('?') ? queryPart.slice(1) : (queryPart ?? '')
    );
    const socketDir = params.get('host')?.trim();
    if (socketDir?.startsWith('/cloudsql/')) {
      const port = Number(params.get('port')) || 5432;
      const decode = (s: string) =>
        decodeURIComponent(s.replace(/\+/g, ' '));
      return {
        path: `${socketDir}/.s.PGSQL.${port}`,
        database,
        user: decode(userEnc),
        password: decode(passwordEnc),
        port,
      };
    }
  }

  return url;
}

function ensurePool(): void {
  if (pgClient) return;
  validateEnv();
  const cfg = postgresConfigFromDatabaseUrl(process.env.DATABASE_URL!);
  pgClient =
    typeof cfg === 'string' ? postgres(cfg) : postgres(cfg);
  drizzleDb = drizzle(pgClient, { schema });
}

/**
 * Lazily creates the Postgres pool on first use so bootstrap can run dotenv.config()
 * and validateEnv() before any DB connection (local dev and predictable Cloud Run startup).
 */
export const db = new Proxy({} as DrizzleInstance, {
  get(_target, prop, receiver) {
    ensurePool();
    const real = drizzleDb as object;
    const value = Reflect.get(real, prop, receiver);
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(drizzleDb);
    }
    return value;
  },
});

/** Closes the Postgres pool (postgres.js). Safe to call multiple times. */
export async function closeDatabase(): Promise<void> {
  if (!pgClient) return;
  const client = pgClient;
  pgClient = undefined;
  drizzleDb = undefined;
  await client.end({ timeout: 10 });
}
