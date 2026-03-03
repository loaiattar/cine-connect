import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { AuthService } from '../services/auth.service';

describe('User profile REST endpoints', () => {
    describe('GET /api/users/me', () => {
        it('returns 401 when not authenticated', async () => {
            const res = await request(app).get('/api/users/me');
            expect(res.status).toBe(401);
            expect(res.body.error).toMatch(/Unauthorized/);
        });

        it('returns current user and profile when authenticated', async () => {
            const email = `profile-get-${Date.now()}@example.com`;
            await AuthService.register('Profile User', email, 'password123');
            const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
            const { token } = loginRes.body;

            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                user: {
                    id: expect.any(Number),
                    name: 'Profile User',
                    email,
                    createdAt: expect.any(String),
                },
            });
            expect(res.body.profile).toMatchObject({
                userId: res.body.user.id,
            });
            expect(['bio', 'avatarUrl', 'location', 'favoriteGenre'].every((k) => k in res.body.profile)).toBe(true);
        });
    });

    describe('PUT /api/users/me', () => {
        it('returns 401 when not authenticated', async () => {
            const res = await request(app).put('/api/users/me').send({ bio: 'Hi' });
            expect(res.status).toBe(401);
        });

        it('updates profile and returns updated profile when authenticated', async () => {
            const email = `profile-put-${Date.now()}@example.com`;
            await AuthService.register('Update User', email, 'password123');
            const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
            const { token } = loginRes.body;

            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bio: 'Movie lover',
                    location: 'Paris',
                    favoriteGenre: 'Sci-Fi',
                    avatarUrl: 'https://example.com/avatar.png',
                });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                bio: 'Movie lover',
                location: 'Paris',
                favoriteGenre: 'Sci-Fi',
                avatarUrl: 'https://example.com/avatar.png',
            });

            const getRes = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
            expect(getRes.body.profile).toMatchObject({
                bio: 'Movie lover',
                location: 'Paris',
                favoriteGenre: 'Sci-Fi',
                avatarUrl: 'https://example.com/avatar.png',
            });
        });

        it('returns 400 for invalid body (e.g. invalid avatarUrl)', async () => {
            const email = `profile-valid-${Date.now()}@example.com`;
            await AuthService.register('Valid User', email, 'password123');
            const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
            const { token } = loginRes.body;

            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ avatarUrl: 'not-a-valid-url' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Validation Failed');
        });
    });
});
