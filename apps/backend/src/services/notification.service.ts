import { db } from "../db";
import { notifications } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const NotificationService = {
    /** List notifications for the current user, newest first. */
    async list(userId: number, limit: number, offset: number) {
        const rows = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(notifications)
            .where(eq(notifications.userId, userId));

        return {
            notifications: rows.map((r) => ({
                id: r.id,
                userId: r.userId,
                message: r.message,
                readAt: r.readAt,
                createdAt: r.createdAt,
            })),
            total: count,
            limit,
            offset,
        };
    },

    /** Mark a single notification as read (must belong to userId). */
    async markAsRead(userId: number, notificationId: number) {
        const [updated] = await db
            .update(notifications)
            .set({ readAt: new Date() })
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
            .returning();
        return updated ?? null;
    },

    /** Mark all notifications for the user as read. */
    async markAllAsRead(userId: number) {
        await db
            .update(notifications)
            .set({ readAt: new Date() })
            .where(eq(notifications.userId, userId));
        return { marked: true };
    },
};
