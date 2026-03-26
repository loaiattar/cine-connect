import { beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../db';
import {
  users,
  favorites,
  comments,
  watchlists,
  ratings,
  notifications,
  follows,
  profiles,
  refreshTokens,
  passwordResetTokens,
} from '../db/schema';
import { sql } from 'drizzle-orm';

let dbAvailable = false;

beforeAll(async () => {
  console.log('Starting Functional Tests...');
  try {
    await db.execute(sql`SELECT 1`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash text NOT NULL UNIQUE,
        expires_at timestamp NOT NULL,
        used_at timestamp,
        created_at timestamp DEFAULT now()
      )
    `);
    dbAvailable = true;
  } catch (error) {
    console.error('Database connection failed. Make sure your Docker DB is running!');
  }
  (globalThis as unknown as { __dbAvailable?: boolean }).__dbAvailable = dbAvailable;
});

beforeEach(async () => {
  if (!dbAvailable) return;
  await db.delete(passwordResetTokens);
  await db.delete(refreshTokens);
  await db.delete(comments);
  await db.delete(favorites);
  await db.delete(watchlists);
  await db.delete(ratings);
  await db.delete(notifications);
  await db.delete(follows);
  await db.delete(profiles);
  await db.delete(users);
});

afterAll(async () => {
  console.log('All Tests Completed.');
});