import { describe, it, expect } from 'vitest';
import { AuthService } from '../services/auth.service';

describe('Auth - Registration', () => {
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
