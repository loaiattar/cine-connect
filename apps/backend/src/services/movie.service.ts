import { db } from "../db";
import { favorites, watchlists, comments, users, ratings } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { AppError, forbidden, notFound } from "../utils";
import { OmdbService } from "./omdb.service";

/** Popular IMDB IDs used for the "trending" list (OMDb has no trending endpoint) */
const POPULAR_IMDB_IDS = [
    "tt1375666", // Inception
    "tt0468569", // The Dark Knight
    "tt0110912", // Pulp Fiction
    "tt0137523", // Fight Club
    "tt0109830", // Forrest Gump
    "tt0133093", // The Matrix
    "tt0816692", // Interstellar
    "tt0245429", // Spirited Away
    "tt6751668", // Parasite
    "tt4154796", // Avengers: Endgame
];

/** Convert an OMDb imdbID (tt1375666) to a numeric id (1375666) for the frontend */
function imdbIdToNumber(imdbId: string): number {
    return parseInt(imdbId.replace("tt", ""), 10);
}

/** Map OMDb full movie to the TMDB-like shape the frontend expects */
function omdbToMovie(m: Record<string, string>) {
    return {
        id: imdbIdToNumber(m.imdbID ?? "tt0"),
        title: m.Title ?? "",
        release_date: m.Year ? `${m.Year}-01-01` : "",
        vote_average: parseFloat(m.imdbRating ?? "0") || 0,
        poster_path: m.Poster !== "N/A" ? m.Poster : "",
        overview: m.Plot ?? "",
        genres: (m.Genre ?? "").split(", ").filter(Boolean).map((name) => ({ name })),
        director: m.Director ?? "",
        actors: m.Actors ?? "",
        awards: m.Awards ?? "",
        imdbID: m.imdbID ?? "",
    };
}

/** Map OMDb search item (from ?s=) to the TMDB-like shape */
function omdbSearchItemToMovie(m: Record<string, string>) {
    return {
        id: imdbIdToNumber(m.imdbID ?? "tt0"),
        title: m.Title ?? "",
        release_date: m.Year ? `${m.Year}-01-01` : "",
        vote_average: 0,
        poster_path: m.Poster !== "N/A" ? m.Poster : "",
        imdbID: m.imdbID ?? "",
    };
}

/** Paginated movie list shape */
export interface PaginatedMovies {
    page: number;
    results: unknown[];
    total_pages: number;
    total_results: number;
}

export const MovieService = {
    async getTrending() {
        const movies = await Promise.allSettled(
            POPULAR_IMDB_IDS.map((id) => OmdbService.getByImdbId(id))
        );
        const results = movies
            .filter((r) => r.status === "fulfilled")
            .map((r) => omdbToMovie((r as PromiseFulfilledResult<unknown>).value as Record<string, string>));
        return { results, total_results: results.length };
    },

    async searchMovies(query: string, page: number, _genre?: number): Promise<PaginatedMovies> {
        const data = await OmdbService.searchByTitle(query, page);
        const results = (data.Search ?? []).map((m) => omdbSearchItemToMovie(m as unknown as Record<string, string>));
        const total = parseInt(data.totalResults ?? "0", 10);
        return {
            page,
            results,
            total_pages: Math.ceil(total / 10),
            total_results: total,
        };
    },

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
        const [newComment] = await db
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
        const [withUser] = await db
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

    async getMovieById(movieId: number) {
        const movie = await OmdbService.getByImdbId(`tt${String(movieId).padStart(7, '0')}`);
        return omdbToMovie(movie as unknown as Record<string, string>);
    },

    async getDetailedMovie(movieId: number, userId?: number) {
        const raw = await OmdbService.getByImdbId(`tt${String(movieId).padStart(7, '0')}`);
        const movieData = omdbToMovie(raw as unknown as Record<string, string>);
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
            console.warn('Database unavailable for getDetailedMovie, returning OMDb data only:', (err as Error)?.message ?? err);
        }

        return {
            ...movieData,
            isFavorite,
            isOnWatchlist,
            comments,
        };
    }
};  