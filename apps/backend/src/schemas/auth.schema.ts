import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(255),
        email: z.string().email("Invalid email format"),
        password: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const refreshSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, "Refresh token is required"),
    }),
});
