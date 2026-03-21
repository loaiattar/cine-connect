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
} from '../db/schema';
import { sql } from 'drizzle-orm';

let dbAvailable = false;

beforeAll(async () => {
  console.log('Starting Functional Tests...');
  try {
    await db.execute(sql`SELECT 1`);
    dbAvailable = true;
  } catch (error) {
    console.error('Database connection failed. Make sure your Docker DB is running!');
  }
  (globalThis as unknown as { __dbAvailable?: boolean }).__dbAvailable = dbAvailable;
});

beforeEach(async () => {
  if (!dbAvailable) return;
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