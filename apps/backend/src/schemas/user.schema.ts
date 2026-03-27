import { z } from "zod";

const userIdParam = z.object({
    userId: z.coerce.number().int().positive("Invalid user ID"),
});

export const getPublicProfileSchema = z.object({
    params: userIdParam,
});

/** Absolute http(s) URL or app-relative upload path from POST /me/avatar. */
const profileAvatarUrl = z.union([
    z.literal(""),
    z.string().url(),
    z.string().regex(/^\/uploads\/\S+$/, "Invalid avatar path"),
]);

export const updateProfileSchema = z.object({
    body: z.object({
        bio: z.string().max(500).optional(),
        avatarUrl: profileAvatarUrl.optional(),
        location: z.string().max(255).optional(),
        favoriteGenre: z.string().max(100).optional(),
    }),
});

export const searchUsersSchema = z.object({
    query: z.object({
        q: z.string().max(100).optional().default(""),
        limit: z.coerce.number().int().min(1).max(100).optional().default(20),
        offset: z.coerce.number().int().min(0).optional().default(0),
    }),
});
