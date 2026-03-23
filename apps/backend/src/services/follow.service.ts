import { db } from "../db";
import { follows, profiles, users } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { badRequest, conflict, notFound } from "../utils";
import type { PublicFollowListUser } from "../types/follow.types";
import { NotificationService } from "./notification.service";

export const FollowService = {
  /** Follow a user. Current user = followerId, target = followingId. */
  async follow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw badRequest("Cannot follow yourself");
    }

    const target = await db.query.users.findFirst({
      where: eq(users.id, followingId),
      columns: { id: true },
    });
    if (!target) throw notFound("User not found");

    const existing = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
    });
    if (existing) throw conflict("Already following this user");

    const [row] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();

    const follower = await db.query.users.findFirst({
      where: eq(users.id, followerId),
      columns: { name: true },
    });
    const displayName = follower?.name?.trim() || "Quelqu'un";
    await NotificationService.create({
      userId: followingId,
      message: `${displayName} vous suit`,
      linkType: "profile",
      targetId: followerId,
    }).catch(() => {});

    return row;
  },

  /** Unfollow a user. */
  async unfollow(followerId: number, followingId: number) {
    const [deleted] = await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .returning({ followerId: follows.followerId, followingId: follows.followingId });
    return deleted ?? null;
  },

  /** List users who follow the given user (followers of userId). */
  async getFollowers(userId: number, limit: number, offset: number) {
    const target = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });
    if (!target) throw notFound("User not found");

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        createdAt: users.createdAt,
        followedAt: follows.createdAt,
        avatarUrl: profiles.avatarUrl,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(follows.followingId, userId))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followingId, userId));

    return {
      users: rows.map(
        (r): PublicFollowListUser => ({
          id: r.id,
          name: r.name,
          createdAt: r.createdAt,
          followedAt: r.followedAt,
          avatarUrl: r.avatarUrl ?? null,
        })
      ),
      total: count,
      limit,
      offset,
    };
  },

  /** List users that the given user is following. */
  async getFollowing(userId: number, limit: number, offset: number) {
    const target = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });
    if (!target) throw notFound("User not found");

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        createdAt: users.createdAt,
        followedAt: follows.createdAt,
        avatarUrl: profiles.avatarUrl,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(follows.followerId, userId))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followerId, userId));

    return {
      users: rows.map(
        (r): PublicFollowListUser => ({
          id: r.id,
          name: r.name,
          createdAt: r.createdAt,
          followedAt: r.followedAt,
          avatarUrl: r.avatarUrl ?? null,
        })
      ),
      total: count,
      limit,
      offset,
    };
  },
};
