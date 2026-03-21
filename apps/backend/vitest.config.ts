import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });


export default defineConfig({
    test: {
        env: {
            NODE_ENV: 'test',
        },
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        setupFiles: ['./src/tests/setup.ts'],
        fileParallelism: false,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/tests/setup.ts', 'src/**/index.ts'],
        },
    },
});