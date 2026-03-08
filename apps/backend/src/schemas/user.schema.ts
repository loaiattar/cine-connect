import { z } from "zod";

const userIdParam = z.object({
    userId: z.coerce.number().int().positive("Invalid user ID"),
});

export const getPublicProfileSchema = z.object({
    params: userIdParam,
});

export const updateProfileSchema = z.object({
    body: z.object({
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional().or(z.literal("")),
        location: z.string().max(255).optional(),
        favoriteGenre: z.string().max(100).optional(),
    }),
});
