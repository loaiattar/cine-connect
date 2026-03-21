import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

const dbAvailable = () => (globalThis as unknown as { __dbAvailable?: boolean }).__dbAvailable === true;

describe('GET /health', () => {
  it('returns 200 with database connected when DB is reachable', async () => {
    const res = await request(app).get('/health');
    if (dbAvailable()) {
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'healthy', database: 'connected' });
    } else {
      expect(res.status).toBe(503);
      expect(res.body).toEqual({ status: 'unhealthy', database: 'disconnected' });
    }
  });
});
