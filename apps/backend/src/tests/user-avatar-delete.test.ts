import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { AuthService } from '../services/auth.service';
import { cookieHeaderFromResponse } from './cookieHelpers';

describe('User avatar upload and account deletion', () => {
    describe('POST /api/v1/users/me/avatar', () => {
        it('returns 401 when not authenticated', async () => {
            const res = await request(app)
                .post('/api/v1/users/me/avatar')
                .attach('avatar', Buffer.from('fake-image-content'), 'avatar.png');
            expect(res.status).toBe(401);
        });

        it('uploads avatar, persists avatarUrl, and returns it in profile', async () => {
            const email = `profile-avatar-${Date.now()}@example.com`;
            await AuthService.register('Avatar User', email, 'password123');
            const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password: 'password123' });
            const cookie = cookieHeaderFromResponse(loginRes);

            const uploadRes = await request(app)
                .post('/api/v1/users/me/avatar')
                .set('Cookie', cookie)
                .attach('avatar', Buffer.from('fake-image-content'), 'avatar.png');

            expect(uploadRes.status).toBe(200);
            expect(uploadRes.body.success).toBe(true);
            expect(uploadRes.body.data.avatarUrl).toMatch(/\/uploads\/avatars\/u\d+-\d+\.(png|jpg|webp|gif)$/);

            const getRes = await request(app).get('/api/v1/users/me').set('Cookie', cookie);
            expect(getRes.status).toBe(200);
            expect(getRes.body.data.profile.avatarUrl).toBe(uploadRes.body.data.avatarUrl);

            const avatarPath = uploadRes.body.data.avatarUrl as string;
            const imgRes = await request(app).get(avatarPath);
            expect(imgRes.status).toBe(200);
            expect(String(imgRes.headers['content-type'] ?? '')).toMatch(/^image\//);
            expect(Buffer.byteLength(imgRes.body as Buffer)).toBeGreaterThan(0);
        });
    });

    describe('DELETE /api/v1/users/me', () => {
        it('returns 401 when not authenticated', async () => {
            const res = await request(app).delete('/api/v1/users/me');
            expect(res.status).toBe(401);
        });

        it('deletes current account and invalidates current session', async () => {
            const email = `profile-delete-${Date.now()}@example.com`;
            await AuthService.register('Delete User', email, 'password123');
            const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password: 'password123' });
            const cookie = cookieHeaderFromResponse(loginRes);

            const deleteRes = await request(app)
                .delete('/api/v1/users/me')
                .set('Cookie', cookie);
            expect(deleteRes.status).toBe(200);
            expect(deleteRes.body.success).toBe(true);
            expect(deleteRes.body.data).toMatchObject({ deleted: true });

            const meAfterDelete = await request(app)
                .get('/api/v1/users/me')
                .set('Cookie', cookie);
            expect([401, 404]).toContain(meAfterDelete.status);
        });
    });
});

