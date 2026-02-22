import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { AuthService } from '../services/auth.service';

describe('Validation Error Handling', () => {
    let userToken: string;

    beforeEach(async () => {
        const auth = await AuthService.register('valuser', `val-${Date.now()}@example.com`, 'password123');
        userToken = auth.token;
    });

    it('should return 400 when movieId is missing in toggle favorite', async () => {
        const response = await request(app)
            .post('/api/movies/favorite')
            .set('Authorization', `Bearer ${userToken}`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Validation Failed');
        expect(response.body.errors[0].path).toBe('body.movieId');
    });

    it('should return 400 when movieId is not a number in toggle favorite', async () => {
        const response = await request(app)
            .post('/api/movies/favorite')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ movieId: 'invalid' });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].path).toBe('body.movieId');
    });

    it('should return 400 when imdbId is not numeric in get movie details', async () => {
        const response = await request(app)
            .get('/api/movies/abc')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(400);
        expect(response.body.errors[0].path).toBe('params.imdbId');
    });

    it('should return 400 when comment is too short', async () => {
        const response = await request(app)
            .post('/api/movies/comments')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ movieId: 550, comment: '' });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].path).toBe('body.comment');
    });

    it('should return 400 when updating a comment with empty text', async () => {
        const response = await request(app)
            .put('/api/movies/comments/123')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ comment: '' });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].path).toBe('body.comment');
    });
});
