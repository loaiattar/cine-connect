import { db } from "../db";
import { users, profiles } from "../db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "../utils";

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
};
