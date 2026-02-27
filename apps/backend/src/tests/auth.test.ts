import { describe, it, expect } from 'vitest';
import request from 'supertest';
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
    describe('POST /api/auth/register', () => {
        it('should register and return token, userId, email (201)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'New User', email: `register-${Date.now()}@example.com`, password: 'password123' });

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({
                token: expect.any(String),
                userId: expect.any(Number),
                email: expect.stringMatching(/@/),
            });
        });

        it('should return 409 when email already exists', async () => {
            const email = `dup-${Date.now()}@example.com`;
            await request(app).post('/api/auth/register').send({ name: 'First', email, password: 'password123' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Second', email, password: 'password456' });

            expect(res.status).toBe(409);
            expect(res.body.error).toBe('Email already registered');
        });

        it('should return 400 for invalid body (missing fields / bad email / short password)', async () => {
            const invalid = await request(app)
                .post('/api/auth/register')
                .send({ name: '', email: 'not-an-email', password: 'short' });

            expect(invalid.status).toBe(400);
            expect(invalid.body.message).toBe('Validation Failed');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login and return token, userId, email (200)', async () => {
            const email = `login-${Date.now()}@example.com`;
            await AuthService.register('Login User', email, 'password123');

            const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                token: expect.any(String),
                userId: expect.any(Number),
                email,
            });
        });

        it('should return 401 for wrong password', async () => {
            const email = `wrongpw-${Date.now()}@example.com`;
            await AuthService.register('User', email, 'password123');

            const res = await request(app).post('/api/auth/login').send({ email, password: 'wrongpassword' });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid credentials');
        });

        it('should return 401 for unknown email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nonexistent@example.com', password: 'password123' });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid credentials');
        });

        it('should return 400 for invalid body', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'bad-email', password: '' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Validation Failed');
        });
    });

    it('token from login works with authMiddleware on protected route', async () => {
        const email = `protected-${Date.now()}@example.com`;
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Protected User', email, password: 'password123' });
        const { token, userId } = registerRes.body;

        const res = await request(app)
            .get(`/api/movies/favorites/${userId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
