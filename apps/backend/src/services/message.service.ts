import { db } from '../db';
import { messages, users } from '../db/schema';
import { desc, eq, sql } from 'drizzle-orm';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export const MessageService = {
  /**
   * Persist a chat message and return it (with optional sender email).
   */
  async create(senderId: number | null, roomId: string, content: string) {
    const [row] = await db
      .insert(messages)
      .values({
        senderId: senderId ?? null,
        roomId,
        content,
      })
      .returning();
    return row;
  },

  /**
   * Get paginated message history for a room, newest first.
   * Each item includes sender email when senderId is set.
   */
  async getByRoom(roomId: string, limit = DEFAULT_LIMIT, offset = 0) {
    const capped = Math.min(Math.max(1, limit), MAX_LIMIT);
    const rows = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        roomId: messages.roomId,
        content: messages.content,
        createdAt: messages.createdAt,
        senderEmail: users.email,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.roomId, roomId))
      .orderBy(desc(messages.createdAt))
      .limit(capped)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(eq(messages.roomId, roomId));

    return {
      messages: rows.map((r) => ({
        id: r.id,
        senderId: r.senderId,
        roomId: r.roomId,
        content: r.content,
        createdAt: r.createdAt,
        senderEmail: r.senderEmail ?? undefined,
      })),
      total: totalResult[0]?.count ?? 0,
      limit: capped,
      offset,
    };
  },
};
