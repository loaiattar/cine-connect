import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { AuthService } from '../services/auth.service';

describe('Movie Functional Tests - Favorites', () => {
    let userToken: string;
    let userId: number;

    beforeEach(async () => {
        const auth = await AuthService.register('testuser', `test-${Date.now()}@example.com`, 'password123');
        userToken = auth.token;
        userId = auth.userId;
    });

    it('should add a movie to favorites', async () => {
        const movieId = 550;

        const response = await request(app)
            .post('/api/movies/favorite')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ movieId });

        expect(response.status).toBe(200);
        expect(response.body.action).toBe('added');
        expect(response.body.movieId).toBe(movieId);
    });

    it('should remove a movie from favorites if it already exists', async () => {
        const movieId = 550;

        // First add it to ensure it exists
        await request(app)
            .post('/api/movies/favorite')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ movieId });

        const response = await request(app)
            .post('/api/movies/favorite')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ movieId });

        expect(response.status).toBe(200);
        expect(response.body.action).toBe('removed');
    });
});