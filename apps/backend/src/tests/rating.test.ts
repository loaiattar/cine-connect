import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { AuthService } from '../services/auth.service';

const movieId = 550;

describe('Rating REST endpoints', () => {
  let userToken: string;
  let userId: number;

  beforeEach(async () => {
    const auth = await AuthService.register(
      'ratinguser',
      `rating-${Date.now()}@example.com`,
      'password123'
    );
    userToken = auth.token;
    userId = auth.userId;
  });

  describe('POST /api/v1/movies/rate', () => {
    it('should submit a rating and return 200 with movieId and rating', async () => {
      const res = await request(app)
        .post('/api/v1/movies/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movieId, rating: 8 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({ movieId, rating: 8 });
    });

    it('should upsert: second submit for same user/movie updates rating', async () => {
      await request(app)
        .post('/api/v1/movies/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movieId, rating: 3 });

      const res = await request(app)
        .post('/api/v1/movies/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movieId, rating: 7 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({ movieId, rating: 7 });
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/v1/movies/rate')
        .send({ movieId, rating: 5 });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 for rating out of range (e.g. 0 or 11)', async () => {
      const resLow = await request(app)
        .post('/api/v1/movies/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movieId, rating: 0 });

      expect(resLow.status).toBe(400);
      expect(resLow.body.success).toBe(false);
      expect(resLow.body.error).toBe('Validation Failed');

      const resHigh = await request(app)
        .post('/api/v1/movies/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movieId, rating: 11 });

      expect(resHigh.status).toBe(400);
    });
  });

  describe('GET /api/v1/movies/rating/:movieId', () => {
    it('should return aggregate (average, count) without auth; no userRating', async () => {
      const res = await request(app).get(`/api/v1/movies/rating/${movieId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('average');
      expect(res.body.data).toHaveProperty('count');
      expect(typeof res.body.data.average).toBe('number');
      expect(typeof res.body.data.count).toBe('number');
      expect(res.body.data.userRating).toBeUndefined();
    });

    it('should return userRating when authenticated and user has rated', async () => {
      await request(app)
        .post('/api/v1/movies/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movieId, rating: 9 });

      const res = await request(app)
        .get(`/api/v1/movies/rating/${movieId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        average: expect.any(Number),
        count: 1,
        userRating: 9,
      });
    });

    it('should return aggregate with multiple ratings', async () => {
      await request(app)
        .post('/api/v1/movies/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movieId, rating: 8 });

      const other = await AuthService.register(
        'other',
        `other-${Date.now()}@example.com`,
        'password123'
      );
      await request(app)
        .post('/api/v1/movies/rate')
        .set('Authorization', `Bearer ${other.token}`)
        .send({ movieId, rating: 6 });

      const res = await request(app).get(`/api/v1/movies/rating/${movieId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(2);
      expect(res.body.data.average).toBe(7); // (8+6)/2
    });
  });
});
