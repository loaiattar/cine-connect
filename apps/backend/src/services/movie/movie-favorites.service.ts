import { db } from "../../db";
import { favorites } from "../../db/schema";
import { and, eq } from "drizzle-orm";

export const MovieFavoritesService = {
  async toggleFavorite(userId: number, movieId: number) {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(favorites)
        .where(
          and(eq(favorites.userId, userId), eq(favorites.externalMovieId, movieId))
        )
        .limit(1);

      if (existing.length > 0) {
        await tx
          .delete(favorites)
          .where(
            and(eq(favorites.userId, userId), eq(favorites.externalMovieId, movieId))
          );
        return { action: "removed" as const, movieId };
      }
      await tx.insert(favorites).values({
        userId,
        externalMovieId: movieId,
      });
      return { action: "added" as const, movieId };
    });
  },

  async getUserFavorites(userId: number) {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  },
};
