import { z } from "zod";

const notificationIdParam = z.object({
    id: z.coerce.number().int().positive("Invalid notification ID"),
});

export const getNotificationsSchema = z.object({
    query: z.object({
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
        unreadOnly: z
            .string()
            .optional()
            .transform((v) => v === "true" || v === "1"),
    }),
});

export const notificationIdParamSchema = z.object({
    params: notificationIdParam,
});
