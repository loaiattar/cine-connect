import { db } from "../db";
import { favorites, watchlists, comments } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { TmdbService } from "./tmdb.service";

export const MovieService = {
    async toggleFavorite(userId: number, movieId: number) {
        const existing = await db
            .select()
            .from(favorites)
            .where(
                and(
                    eq(favorites.userId, userId),
                    eq(favorites.externalMovieId, movieId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            await db
                .delete(favorites)
                .where(
                    and(
                        eq(favorites.userId, userId),
                        eq(favorites.externalMovieId, movieId)
                    )
                );
            return { action: "removed", movieId };
        } else {
            await db.insert(favorites).values({
                userId,
                externalMovieId: movieId,
            });
            return { action: "added", movieId };
        }
    },

    async getUserFavorites(userId: number) {
        const userFavorites = await db
            .select()
            .from(favorites)
            .where(eq(favorites.userId, userId));
        return userFavorites;
    },

    async toggleWatchlist(userId: number, movieId: number) {
        const existing = await db
            .select()
            .from(watchlists)
            .where(
                and(
                    eq(watchlists.userId, userId),
                    eq(watchlists.externalMovieId, movieId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            await db
                .delete(watchlists)
                .where(
                    and(
                        eq(watchlists.userId, userId),
                        eq(watchlists.externalMovieId, movieId)
                    )
                );
            return { action: "removed", movieId };
        } else {
            await db.insert(watchlists).values({
                userId,
                externalMovieId: movieId,
            });
            return { action: "added", movieId };
        }
    },

    async getMovieWatchlist(userId: number) {
        const userWatchlist = await db
            .select()
            .from(watchlists)
            .where(eq(watchlists.userId, userId));
        return userWatchlist;
    },

    async deleteMovieFromWatchlist(userId: number, movieId: number) {
        const existing = await db
            .select()
            .from(watchlists)
            .where(
                and(
                    eq(watchlists.userId, userId),
                    eq(watchlists.externalMovieId, movieId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            await db
                .delete(watchlists)
                .where(
                    and(
                        eq(watchlists.userId, userId),
                        eq(watchlists.externalMovieId, movieId)
                    )
                );
            return { action: "removed", movieId };
        } else {
            return { action: "not_found", movieId };
        }
    },

    async addComment(userId: number, movieId: number, comment: string) {
        const existing = await db
            .select()
            .from(comments)
            .where(
                and(
                    eq(comments.userId, userId),
                    eq(comments.externalMovieId, movieId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(comments)
                .set({ comment })
                .where(
                    and(
                        eq(comments.userId, userId),
                        eq(comments.externalMovieId, movieId)
                    )
                );
            return { action: "updated", movieId };
        } else {
            await db.insert(comments).values({
                userId,
                externalMovieId: movieId,
                comment,
            });
            return { action: "added", movieId };
        }
    },

    async getMovieComments(movieId: number) {
        const movieComments = await db
            .select()
            .from(comments)
            .where(eq(comments.externalMovieId, movieId));
        return movieComments;
    },

    async deleteComment(userId: number, movieId: number) {
        const existing = await db
            .select()
            .from(comments)
            .where(
                and(
                    eq(comments.userId, userId),
                    eq(comments.externalMovieId, movieId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            await db
                .delete(comments)
                .where(
                    and(
                        eq(comments.userId, userId),
                        eq(comments.externalMovieId, movieId)
                    )
                );
            return { action: "removed", movieId };
        } else {
            return { action: "not_found", movieId };
        }
    },

    async updateComment(userId: number, movieId: number, comment: string) {
        const existing = await db
            .select()
            .from(comments)
            .where(
                and(
                    eq(comments.userId, userId),
                    eq(comments.externalMovieId, movieId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(comments)
                .set({ comment })
                .where(
                    and(
                        eq(comments.userId, userId),
                        eq(comments.externalMovieId, movieId)
                    )
                );
            return { action: "updated", movieId };
        } else {
            return { action: "not_found", movieId };
        }
    },

    async getMovieById(movieId: number, userId?: number) {
        const movie = await TmdbService.getMovieDetails(movieId);
        return movie;
    }
};  