import { db } from "../db";
import { favorites, watchlists, comments } from "../db/schema";
import { eq, and } from "drizzle-orm";

const API_KEY = process.env.EXTERNAL_API_KEY;
const BASE_URL = process.env.EXTERNAL_API_URL;

export const MovieService = {
    async toggleFavorite(userId: number, movieId: number) {
        const existing = await db.query.favorites.findFirst({
            where: and(
                eq(favorites.userId, userId),
                eq(favorites.externalMovieId, movieId)
            ),
        });

        if (existing) {
            await db.delete(favorites).where(eq(favorites.id, existing.id));
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
        const favs = await db.query.favorites.findMany({
            where: eq(favorites.userId, userId),
        });
        
        return favs;
    },

    async addToWatchlist(userId: number, movieId: number) {
        return await db.insert(watchlists).values({
            userId,
            externalMovieId: movieId,
        }).onConflictDoNothing();
    },

    async getMovieById(movieId: number, userId?: number) {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
        const movieData = await response.json();

        let isFavorite = false;
        if (userId) {
            const fav = await db.query.favorites.findFirst({
                where: and(
                    eq(favorites.userId, userId),
                    eq(favorites.externalMovieId, movieId)
                ),
            });
            isFavorite = !!fav;
        }

        const movieComments = await db.query.comments.findMany({
            where: eq(comments.externalMovieId, movieId),
            with: { user: true }
        });

        return {movieData, isFavorite, localComments: movieComments };
    },

    async getMovieComments(movieId: number) {
        return await db.query.comments.findMany({
            where: eq(comments.externalMovieId, movieId),
            with: { user: true }
        });
    },

    async addComment(userId: number, movieId: number, comment: string) {
        return await db.insert(comments).values({
            userId,
            externalMovieId: movieId,
            comment,
        });
    },

    async deleteComment(userId: number, movieId: number, comment: string) {
        return await db.delete(comments).where(and(
            eq(comments.userId, userId),
            eq(comments.externalMovieId, movieId),
            eq(comments.comment, comment)
        ));
    },

    async updateComment(userId: number, movieId: number, comment: string) {
        return await db.update(comments).set({
            comment,
        }).where(and(
            eq(comments.userId, userId),
            eq(comments.externalMovieId, movieId)
        ));
    },

    async getMovieWatchlist(userId: number) {
        return await db.query.watchlists.findMany({
            where: eq(watchlists.userId, userId),
        });
    },

    async deleteMovieFromWatchlist(userId: number, movieId: number) {
        return await db.delete(watchlists).where(and(
            eq(watchlists.userId, userId),
            eq(watchlists.externalMovieId, movieId)
        ));
    },
};