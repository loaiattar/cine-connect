import { z } from "zod";

const userIdParam = z.object({
    userId: z.coerce.number().int().positive("Invalid user ID"),
});

export const followBodySchema = z.object({
    body: z.object({
        followingId: z.number().int().positive("Invalid following ID"),
    }),
});

export const userIdParamSchema = z.object({
    params: userIdParam,
});

export const getFollowersSchema = z.object({
    params: userIdParam,
    query: z.object({
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
    }),
});

export const getFollowingSchema = z.object({
    params: userIdParam,
    query: z.object({
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
    }),
});
