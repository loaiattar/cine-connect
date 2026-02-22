import { beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../db';
import { users, favorites, comments } from '../db/schema';
import { sql } from 'drizzle-orm';

beforeAll(async () => {
  console.log('Starting Functional Tests...');
  try {
    await db.execute(sql`SELECT 1`);
  } catch (error) {
    console.error('Database connection failed. Make sure your Docker DB is running!');
    process.exit(1);
  }
});

beforeEach(async () => {
  await db.delete(comments);
  await db.delete(favorites);
  await db.delete(users);
});

afterAll(async () => {
  console.log('All Tests Completed.');
});