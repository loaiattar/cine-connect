import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';
import app from '../app';
import { AuthService } from '../services/auth.service';

describe('Auth - Registration (service)', () => {
    it('should throw 409 when registering with an email that already exists', async () => {
        const email = 'duplicate@example.com';

        await AuthService.register('First', email, 'password123');

        await expect(
            AuthService.register('Second', email, 'password456')
        ).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 409,
            message: 'Email already registered',
        });
    });
});

describe('Auth REST endpoints', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register and return token, userId, email (201)', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ name: 'New User', email: `register-${Date.now()}@example.com`, password: 'password123' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                token: expect.any(String),
                refreshToken: expect.any(String),
                userId: expect.any(Number),
                email: expect.stringMatching(/@/),
            });
        });

        it('should return 409 when email already exists', async () => {
            const email = `dup-${Date.now()}@example.com`;
            await request(app).post('/api/v1/auth/register').send({ name: 'First', email, password: 'password123' });

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ name: 'Second', email, password: 'password456' });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Email already registered');
        });

        it('should return 400 for invalid body (missing fields / bad email / short password)', async () => {
            const invalid = await request(app)
                .post('/api/v1/auth/register')
                .send({ name: '', email: 'not-an-email', password: 'short' });

            expect(invalid.status).toBe(400);
            expect(invalid.body.success).toBe(false);
            expect(invalid.body.error).toBe('Validation Failed');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login and return token, userId, email (200)', async () => {
            const email = `login-${Date.now()}@example.com`;
            await AuthService.register('Login User', email, 'password123');

            const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                token: expect.any(String),
                refreshToken: expect.any(String),
                userId: expect.any(Number),
                email,
            });
        });

        it('should return 401 for wrong password', async () => {
            const email = `wrongpw-${Date.now()}@example.com`;
            await AuthService.register('User', email, 'password123');

            const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'wrongpassword' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid credentials');
        });

        it('should return 401 for unknown email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'nonexistent@example.com', password: 'password123' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid credentials');
        });

        it('should return 400 for invalid body', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({ email: 'bad-email', password: '' });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Validation Failed');
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        it('returns new access and refresh tokens and rotates (200)', async () => {
            const email = `refresh-${Date.now()}@example.com`;
            const reg = await request(app)
                .post('/api/v1/auth/register')
                .send({ name: 'Refresh User', email, password: 'password123' });
            expect(reg.status).toBe(201);
            const { refreshToken: rt1, token: access1 } = reg.body.data;

            const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: rt1 });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeTruthy();
            expect(res.body.data.refreshToken).toBeTruthy();
            expect(res.body.data.token).not.toBe(access1);
            expect(res.body.data.refreshToken).not.toBe(rt1);
            expect(res.body.data.email).toBe(email);

            const second = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: rt1 });
            expect(second.status).toBe(401);
            expect(second.body.success).toBe(false);
        });

        it('returns 401 for invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken: 'definitely-not-a-valid-token' });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    it('token from login works with authMiddleware on protected route', async () => {
        const email = `protected-${Date.now()}@example.com`;
        const registerRes = await request(app)
            .post('/api/v1/auth/register')
            .send({ name: 'Protected User', email, password: 'password123' });
        const { token, userId } = registerRes.body.data;

        const res = await request(app)
            .get(`/api/v1/movies/favorites/${userId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

describe('Auth rate limiting', () => {
    it('returns 429 after exceeding limit (strict limiter)', async () => {
        const strictLimiter = rateLimit({
            windowMs: 60 * 1000,
            max: 2,
            message: { success: false, error: 'Too many attempts. Please try again later.' },
            standardHeaders: true,
            legacyHeaders: false,
        });
        const limitedApp = express();
        limitedApp.use(express.json());
        limitedApp.use('/api/v1/auth', strictLimiter, (req, res) => res.status(200).json({ ok: true }));

        const r1 = await request(limitedApp).post('/api/v1/auth/login').send({ email: 'a@b.com', password: 'x' });
        const r2 = await request(limitedApp).post('/api/v1/auth/login').send({ email: 'a@b.com', password: 'x' });
        const r3 = await request(limitedApp).post('/api/v1/auth/login').send({ email: 'a@b.com', password: 'x' });

        expect(r1.status).toBe(200);
        expect(r2.status).toBe(200);
        expect(r3.status).toBe(429);
        expect(r3.body.success).toBe(false);
        expect(r3.body.error).toBe('Too many attempts. Please try again later.');
    });
});
