import { db } from "../db";
import { favorites, watchlists, comments, users, ratings, follows, notifications } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { AppError, forbidden, notFound } from "../utils";
import { TmdbService } from "./tmdb.service";

/** Paginated movie list shape (TMDB search/trending style) */
export interface PaginatedMovies {
    page: number;
    results: Array<{ genre_ids?: number[]; [key: string]: unknown }>;
    total_pages: number;
    total_results: number;
}

export const MovieService = {
    async getTrending() {
        const data = await TmdbService.getTrendingMovies();
        return data;
    },

    async searchMovies(query: string, page: number, genre?: number): Promise<PaginatedMovies> {
        const data = await TmdbService.searchMovies(query, page);
        const result: PaginatedMovies = {
            page: data.page ?? page,
            results: data.results ?? [],
            total_pages: data.total_pages ?? 0,
            total_results: data.total_results ?? 0,
        };
        if (genre != null && result.results.length > 0) {
            const filtered = result.results.filter(
                (m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(genre)
            );
            result.results = filtered;
            result.total_results = filtered.length;
            // total_pages is ambiguous when filtering; keep page as-is for consistency
        }
        return result;
    },

    async toggleFavorite(userId: number, movieId: number) {
        return db.transaction(async (tx) => {
            const existing = await tx
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
                await tx
                    .delete(favorites)
                    .where(
                        and(
                            eq(favorites.userId, userId),
                            eq(favorites.externalMovieId, movieId)
                        )
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
        const userFavorites = await db
            .select()
            .from(favorites)
            .where(eq(favorites.userId, userId));
        return userFavorites;
    },

    async toggleWatchlist(userId: number, movieId: number) {
        return db.transaction(async (tx) => {
            const existing = await tx
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
                await tx
                    .delete(watchlists)
                    .where(
                        and(
                            eq(watchlists.userId, userId),
                            eq(watchlists.externalMovieId, movieId)
                        )
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
        const userWatchlist = await db
            .select()
            .from(watchlists)
            .where(eq(watchlists.userId, userId));
        return userWatchlist;
    },

    async deleteMovieFromWatchlist(userId: number, movieId: number) {
        return db.transaction(async (tx) => {
            const existing = await tx
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
                await tx
                    .delete(watchlists)
                    .where(
                        and(
                            eq(watchlists.userId, userId),
                            eq(watchlists.externalMovieId, movieId)
                        )
                    );
                return { action: "removed" as const, movieId };
            }
            return { action: "not_found" as const, movieId };
        });
    },

    async addComment(userId: number, movieId: number, comment: string) {
        return db.transaction(async (tx) => {
            const [newComment] = await tx
                .insert(comments)
                .values({
                    userId,
                    externalMovieId: movieId,
                    comment,
                })
                .returning();

            if (!newComment) {
                throw new AppError("Failed to create comment", 500);
            }

            const [commenter] = await tx
                .select({ name: users.name })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);
            const displayName = commenter?.name?.trim() || "Un membre";

            const followerRows = await tx
                .select({ followerId: follows.followerId })
                .from(follows)
                .where(eq(follows.followingId, userId));

            if (followerRows.length > 0) {
                const message = `${displayName} a laissé un commentaire sur un film`;
                await tx.insert(notifications).values(
                    followerRows.map((f) => ({
                        userId: f.followerId,
                        message,
                        linkType: "movie",
                        targetId: movieId,
                    }))
                );
            }

            const [withUser] = await tx
                .select({
                    id: comments.id,
                    userId: comments.userId,
                    externalMovieId: comments.externalMovieId,
                    comment: comments.comment,
                    createdAt: comments.createdAt,
                    userEmail: users.email,
                    userName: users.name,
                })
                .from(comments)
                .leftJoin(users, eq(comments.userId, users.id))
                .where(eq(comments.id, newComment.id))
                .limit(1);
            return withUser ?? newComment;
        });
    },

    async getMovieComments(movieId: number) {
        const movieComments = await db
            .select({
                id: comments.id,
                userId: comments.userId,
                externalMovieId: comments.externalMovieId,
                comment: comments.comment,
                createdAt: comments.createdAt,
                userEmail: users.email,
                userName: users.name,
            })
            .from(comments)
            .leftJoin(users, eq(comments.userId, users.id))
            .where(eq(comments.externalMovieId, movieId));
        return movieComments;
    },

    async deleteComment(userId: number, commentId: number) {
        const [existing] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, commentId))
            .limit(1);

        if (!existing) {
            throw notFound("Comment not found");
        }

        if (existing.userId !== userId) {
            throw forbidden("You can only delete your own comments");
        }

        await db
            .delete(comments)
            .where(eq(comments.id, commentId));

        return { action: "removed" };
    },

    async updateComment(userId: number, commentId: number, comment: string) {
        const [existing] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, commentId))
            .limit(1);

        if (!existing) {
            throw notFound("Comment not found");
        }

        if (existing.userId !== userId) {
            throw forbidden("You can only update your own comments");
        }

        await db
            .update(comments)
            .set({ comment })
            .where(eq(comments.id, commentId));

        return { action: "updated" };
    },

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
                    and(
                        eq(ratings.userId, userId),
                        eq(ratings.externalMovieId, movieId)
                    )
                )
                .limit(1);
            if (row) result.userRating = row.rating;
        }

        return result;
    },

    async getMovieById(movieId: number, userId?: number) {
        const movie = await TmdbService.getMovieDetails(movieId);
        return movie;
    },

    async getDetailedMovie(movieId: number, userId?: number) {
        const movieData = await TmdbService.getMovieDetails(movieId);
        let isFavorite = false;
        let isOnWatchlist = false;
        let comments: Awaited<ReturnType<typeof this.getMovieComments>> = [];

        try {
            if (userId) {
                const [favorite] = await db
                    .select()
                    .from(favorites)
                    .where(
                        and(
                            eq(favorites.userId, userId),
                            eq(favorites.externalMovieId, movieId)
                        )
                    )
                    .limit(1);
                isFavorite = !!favorite;

                const [watchlist] = await db
                    .select()
                    .from(watchlists)
                    .where(
                        and(
                            eq(watchlists.userId, userId),
                            eq(watchlists.externalMovieId, movieId)
                        )
                    )
                    .limit(1);
                isOnWatchlist = !!watchlist;
            }
            comments = await this.getMovieComments(movieId);
        } catch (err) {
            // DB unreachable (e.g. ECONNREFUSED): return TMDB data only; no favorites/watchlist/comments
            console.warn('Database unavailable for getDetailedMovie, returning TMDB data only:', (err as Error)?.message ?? err);
        }

        return {
            ...movieData,
            isFavorite,
            isOnWatchlist,
            comments,
        };
    }
};  