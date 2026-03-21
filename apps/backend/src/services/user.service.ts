import { db } from "../db";
import { users, profiles } from "../db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { notFound } from "../utils";

/** Escape `%`, `_`, and `\` for use in ILIKE … ESCAPE '\\' (PostgreSQL). */
function escapeILikePattern(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export type PublicUserSearchRow = {
  id: number;
  name: string | null;
  avatarUrl: string | null;
};

export const UserService = {
  async getMe(userId: number) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) throw notFound("User not found");

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile: profile
        ? {
            id: profile.id,
            userId: profile.userId,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            favoriteGenre: profile.favoriteGenre,
          }
        : null,
    };
  },

  /** Public profile for any user (no email). */
  async getPublicProfile(targetUserId: number) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
      columns: { id: true, name: true, createdAt: true },
    });
    if (!user) throw notFound("User not found");

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, targetUserId),
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        createdAt: user.createdAt,
      },
      profile: profile
        ? {
            id: profile.id,
            userId: profile.userId,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            favoriteGenre: profile.favoriteGenre,
          }
        : null,
    };
  },

  async updateProfile(
    userId: number,
    data: { bio?: string; avatarUrl?: string; location?: string; favoriteGenre?: string }
  ) {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });
    if (!profile) throw notFound("Profile not found");

    const update: Record<string, string | null | undefined> = {};
    if (data.bio !== undefined) update.bio = data.bio;
    if (data.avatarUrl !== undefined) update.avatarUrl = data.avatarUrl === "" ? null : data.avatarUrl;
    if (data.location !== undefined) update.location = data.location;
    if (data.favoriteGenre !== undefined) update.favoriteGenre = data.favoriteGenre;

    const [updated] = await db
      .update(profiles)
      .set(update)
      .where(eq(profiles.userId, userId))
      .returning();

    return updated;
  },

  /**
   * Search users by name or email (email is matched internally but never returned).
   * Public DTO: id, name, avatarUrl only.
   */
  async searchPublicUsers(rawQuery: string, limit: number, offset: number) {
    const q = rawQuery.trim().slice(0, 100);
    if (q.length === 0) {
      return { users: [] as PublicUserSearchRow[], total: 0, limit, offset };
    }

    const pattern = `%${escapeILikePattern(q)}%`;
    const whereClause = sql`(${users.name} ILIKE ${pattern} ESCAPE '\\' OR ${users.email} ILIKE ${pattern} ESCAPE '\\')`;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: profiles.avatarUrl,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(whereClause)
      .orderBy(asc(users.name), asc(users.id))
      .limit(limit)
      .offset(offset);

    return {
      users: rows.map((r) => ({
        id: r.id,
        name: r.name,
        avatarUrl: r.avatarUrl ?? null,
      })),
      total: count,
      limit,
      offset,
    };
  },
};
