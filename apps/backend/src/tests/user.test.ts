import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { AuthService } from '../services/auth.service';

describe('User profile REST endpoints', () => {
    describe('GET /api/v1/users/me', () => {
        it('returns 401 when not authenticated', async () => {
            const res = await request(app).get('/api/v1/users/me');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/Unauthorized/);
        });

        it('returns current user and profile when authenticated', async () => {
            const email = `profile-get-${Date.now()}@example.com`;
            await AuthService.register('Profile User', email, 'password123');
            const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password: 'password123' });
            const { token } = loginRes.body.data;

            const res = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                user: {
                    id: expect.any(Number),
                    name: 'Profile User',
                    email,
                    createdAt: expect.any(String),
                },
            });
            expect(res.body.data.profile).toMatchObject({
                userId: res.body.data.user.id,
            });
            expect(['bio', 'avatarUrl', 'location', 'favoriteGenre'].every((k) => k in res.body.data.profile)).toBe(true);
        });
    });

    describe('PUT /api/v1/users/me', () => {
        it('returns 401 when not authenticated', async () => {
            const res = await request(app).put('/api/v1/users/me').send({ bio: 'Hi' });
            expect(res.status).toBe(401);
        });

        it('updates profile and returns updated profile when authenticated', async () => {
            const email = `profile-put-${Date.now()}@example.com`;
            await AuthService.register('Update User', email, 'password123');
            const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password: 'password123' });
            const { token } = loginRes.body.data;

            const res = await request(app)
                .put('/api/v1/users/me')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bio: 'Movie lover',
                    location: 'Paris',
                    favoriteGenre: 'Sci-Fi',
                    avatarUrl: 'https://example.com/avatar.png',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                bio: 'Movie lover',
                location: 'Paris',
                favoriteGenre: 'Sci-Fi',
                avatarUrl: 'https://example.com/avatar.png',
            });

            const getRes = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`);
            expect(getRes.body.data.profile).toMatchObject({
                bio: 'Movie lover',
                location: 'Paris',
                favoriteGenre: 'Sci-Fi',
                avatarUrl: 'https://example.com/avatar.png',
            });
        });

        it('returns 400 for invalid body (e.g. invalid avatarUrl)', async () => {
            const email = `profile-valid-${Date.now()}@example.com`;
            await AuthService.register('Valid User', email, 'password123');
            const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password: 'password123' });
            const { token } = loginRes.body.data;

            const res = await request(app)
                .put('/api/v1/users/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ avatarUrl: 'not-a-valid-url' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Validation Failed');
        });
    });

    describe('GET /api/v1/users/search', () => {
        it('returns empty list when q is missing or blank', async () => {
            const res = await request(app).get('/api/v1/users/search');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                users: [],
                total: 0,
                limit: 20,
                offset: 0,
            });
        });

        it('finds users by name and omits email from results', async () => {
            const suffix = Date.now();
            const email = `search-u1-${suffix}@example.com`;
            await AuthService.register('SearchUniqueNameAlpha', email, 'password123');

            const res = await request(app).get('/api/v1/users/search').query({ q: 'SearchUnique' });
            expect(res.status).toBe(200);
            expect(res.body.data.total).toBeGreaterThanOrEqual(1);
            const row = res.body.data.users.find((u: { name: string | null }) => u.name === 'SearchUniqueNameAlpha');
            expect(row).toBeDefined();
            expect(row).toMatchObject({
                name: 'SearchUniqueNameAlpha',
                avatarUrl: null,
            });
            expect(row).not.toHaveProperty('email');
        });

        it('matches by email locally but never exposes email', async () => {
            const suffix = Date.now();
            const email = `hidden-mail-${suffix}@example.com`;
            await AuthService.register('Hidden Mail User', email, 'password123');

            const res = await request(app).get('/api/v1/users/search').query({ q: `hidden-mail-${suffix}` });
            expect(res.status).toBe(200);
            expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
            const row = res.body.data.users[0];
            expect(row).not.toHaveProperty('email');
            expect(row.name).toBe('Hidden Mail User');
        });

        it('returns 400 when q exceeds max length', async () => {
            const res = await request(app).get('/api/v1/users/search').query({ q: 'a'.repeat(101) });
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/v1/users/:userId', () => {
        it('returns 404 for unknown user id', async () => {
            const res = await request(app).get('/api/v1/users/999999999');
            expect(res.status).toBe(404);
        });

        it('returns public profile with stats and no email when unauthenticated', async () => {
            const suffix = Date.now();
            const email = `pub-${suffix}@example.com`;
            const { userId } = await AuthService.register('Public Api User', email, 'password123');

            const res = await request(app).get(`/api/v1/users/${userId}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                user: { id: userId, name: 'Public Api User' },
                stats: { followersCount: 0, followingCount: 0 },
            });
            expect(res.body.data.user).not.toHaveProperty('email');
            expect(res.body.data).not.toHaveProperty('isFollowing');
        });

        it('includes isFollowing for an authenticated viewer of another user', async () => {
            const a = await AuthService.register('Viewer A', `v-a-${Date.now()}@ex.com`, 'password123');
            const b = await AuthService.register('Target B', `t-b-${Date.now()}@ex.com`, 'password123');

            const res = await request(app)
                .get(`/api/v1/users/${b.userId}`)
                .set('Authorization', `Bearer ${a.token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.isFollowing).toBe(false);

            await request(app)
                .post('/api/v1/follows')
                .set('Authorization', `Bearer ${a.token}`)
                .send({ followingId: b.userId });

            const res2 = await request(app)
                .get(`/api/v1/users/${b.userId}`)
                .set('Authorization', `Bearer ${a.token}`);
            expect(res2.status).toBe(200);
            expect(res2.body.data.isFollowing).toBe(true);
        });
    });

    describe('GET /api/v1/users/:userId/followers', () => {
        it('returns 404 for unknown user id', async () => {
            const res = await request(app).get('/api/v1/users/999999999/followers');
            expect(res.status).toBe(404);
        });

        it('lists followers without email in each user row', async () => {
            const follower = await AuthService.register(
                'Follower Listed',
                `fol-list-${Date.now()}@example.com`,
                'password123'
            );
            const target = await AuthService.register(
                'Target Listed',
                `tar-list-${Date.now()}@example.com`,
                'password123'
            );

            await request(app)
                .post('/api/v1/follows')
                .set('Authorization', `Bearer ${follower.token}`)
                .send({ followingId: target.userId });

            const res = await request(app).get(`/api/v1/users/${target.userId}/followers`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.total).toBe(1);
            expect(res.body.data.users).toHaveLength(1);
            const row = res.body.data.users[0];
            expect(row).toMatchObject({
                id: follower.userId,
                name: 'Follower Listed',
                avatarUrl: null,
            });
            expect(row).not.toHaveProperty('email');
            expect(row).toHaveProperty('followedAt');
            expect(row).toHaveProperty('createdAt');
        });
    });

    describe('GET /api/v1/users/:userId/following', () => {
        it('returns 404 for unknown user id', async () => {
            const res = await request(app).get('/api/v1/users/999999999/following');
            expect(res.status).toBe(404);
        });

        it('lists following without email in each user row', async () => {
            const viewer = await AuthService.register(
                'Viewer Following',
                `view-f-${Date.now()}@example.com`,
                'password123'
            );
            const followed = await AuthService.register(
                'Followed User',
                `fol-u-${Date.now()}@example.com`,
                'password123'
            );

            await request(app)
                .post('/api/v1/follows')
                .set('Authorization', `Bearer ${viewer.token}`)
                .send({ followingId: followed.userId });

            const res = await request(app).get(`/api/v1/users/${viewer.userId}/following`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.total).toBe(1);
            const row = res.body.data.users[0];
            expect(row).toMatchObject({
                id: followed.userId,
                name: 'Followed User',
                avatarUrl: null,
            });
            expect(row).not.toHaveProperty('email');
        });
    });
});
