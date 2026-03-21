import { db } from "../../db";
import { watchlists } from "../../db/schema";
import { and, eq } from "drizzle-orm";

export const MovieWatchlistService = {
  async toggleWatchlist(userId: number, movieId: number) {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(watchlists)
        .where(
          and(eq(watchlists.userId, userId), eq(watchlists.externalMovieId, movieId))
        )
        .limit(1);

      if (existing.length > 0) {
        await tx
          .delete(watchlists)
          .where(
            and(eq(watchlists.userId, userId), eq(watchlists.externalMovieId, movieId))
          );
        return { action: "removed" as const, movieId };
      }
      await tx.insert(watchlists).values({
        userId,
        externalMovieId: movieId,
      });
      return { action: "added" as const, movieId };
    });
  },

  async getMovieWatchlist(userId: number) {
    return db.select().from(watchlists).where(eq(watchlists.userId, userId));
  },

  async deleteMovieFromWatchlist(userId: number, movieId: number) {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(watchlists)
        .where(
          and(eq(watchlists.userId, userId), eq(watchlists.externalMovieId, movieId))
        )
        .limit(1);

      if (existing.length > 0) {
        await tx
          .delete(watchlists)
          .where(
            and(eq(watchlists.userId, userId), eq(watchlists.externalMovieId, movieId))
          );
        return { action: "removed" as const, movieId };
      }
      return { action: "not_found" as const, movieId };
    });
  },
};
