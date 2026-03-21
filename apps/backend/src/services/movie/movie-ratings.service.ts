import { db } from "../../db";
import { ratings } from "../../db/schema";
import { and, eq, sql } from "drizzle-orm";

export const MovieRatingsService = {
  async submitRating(userId: number, movieId: number, rating: number) {
    await db
      .insert(ratings)
      .values({
        userId,
        externalMovieId: movieId,
        rating,
      })
      .onConflictDoUpdate({
        target: [ratings.userId, ratings.externalMovieId],
        set: { rating },
      });
    return { movieId, rating };
  },

  async getMovieRating(movieId: number, userId?: number) {
    const aggregate = await db
      .select({
        count: sql<number>`count(*)::int`,
        average: sql<number>`coalesce(round(avg(${ratings.rating})::numeric, 2), 0)::float`,
      })
      .from(ratings)
      .where(eq(ratings.externalMovieId, movieId));

    const result: { userRating?: number; average: number; count: number } = {
      average: Number(aggregate[0]?.average ?? 0),
      count: aggregate[0]?.count ?? 0,
    };

    if (userId != null) {
      const [row] = await db
        .select({ rating: ratings.rating })
        .from(ratings)
        .where(
          and(eq(ratings.userId, userId), eq(ratings.externalMovieId, movieId))
        )
        .limit(1);
      if (row) result.userRating = row.rating;
    }

    return result;
  },
};
