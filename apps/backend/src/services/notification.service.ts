import { db } from "../db";
import { notifications } from "../db/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";

export interface CreateNotificationOptions {
    userId: number;
    message: string;
    linkType?: string | null;
    targetId?: number | null;
}

export const NotificationService = {
    /** List notifications for the current user, newest first. Optional unreadOnly filter. */
    async list(
        userId: number,
        limit: number,
        offset: number,
        unreadOnly = false
    ) {
        const conditions = unreadOnly
            ? and(eq(notifications.userId, userId), isNull(notifications.readAt))
            : eq(notifications.userId, userId);

        const rows = await db
            .select()
            .from(notifications)
            .where(conditions)
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(notifications)
            .where(conditions);

        return {
            notifications: rows.map((r) => ({
                id: r.id,
                userId: r.userId,
                message: r.message,
                readAt: r.readAt,
                createdAt: r.createdAt,
                linkType: r.linkType ?? null,
                targetId: r.targetId ?? null,
            })),
            total: count,
            limit,
            offset,
        };
    },

    /** Create a notification for a user (e.g. on follow, comment, like). */
    async create(options: CreateNotificationOptions) {
        const [row] = await db
            .insert(notifications)
            .values({
                userId: options.userId,
                message: options.message,
                linkType: options.linkType ?? null,
                targetId: options.targetId ?? null,
            })
            .returning();
        return row;
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
