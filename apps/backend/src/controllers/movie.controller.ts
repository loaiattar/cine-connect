import { Request, Response } from "express";
import { MovieService } from "../services/movie.service";
import { ToggleFavoriteRequest } from "@cine-connect/shared";

export const MovieController = {
    async handleToggleFavorite(
        req: Request<{}, {}, ToggleFavoriteRequest>,
        res: Response
    ) {
        try {
            const { userId, movieId } = req.body;

            if (!userId || !movieId) {
                return res.status(400).json({ error: "Missing userId or movieId" });
            }

            const result = await MovieService.toggleFavorite(userId, movieId);
            return res.json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async getMovieDetails(req: Request<{ imdbId: string }>, res: Response) {
        try {
            const { imdbId } = req.params;
            const userId = req.query.userId ? Number(req.query.userId) : undefined;

            const movie = await MovieService.getMovieById(Number(imdbId), userId);
            return res.json(movie);
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch movie" });
        }
    },

    async getUserFavorites(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        try {
            const { userId } = req.params;
            const favorites = await MovieService.getUserFavorites(Number(userId));
            return res.json(favorites);
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch favorites" });
        }
    },

    async addToWatchlist(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        try {
            const { userId } = req.params;
            const { movieId } = req.body;
            const result = await MovieService.addToWatchlist(Number(userId), Number(movieId));
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: "Failed to add to watchlist" });
        }
    },

    async getMovieComments(
        req: Request<{ movieId: string }>,
        res: Response
    ) {
        try {
            const { movieId } = req.params;
            const comments = await MovieService.getMovieComments(Number(movieId));
            return res.json(comments);
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch comments" });
        }
    },

    async addComment(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        try {
            const { userId } = req.params;
            const { movieId, comment } = req.body;
            const result = await MovieService.addComment(Number(userId), Number(movieId), comment);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: "Failed to add comment" });
        }
    },

    async deleteComment(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        try {
            const { userId } = req.params;
            const { movieId, comment } = req.body;
            const result = await MovieService.deleteComment(Number(userId), Number(movieId), comment);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: "Failed to delete comment" });
        }
    },

    async updateComment(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        try {
            const { userId } = req.params;
            const { movieId, comment } = req.body;
            const result = await MovieService.updateComment(Number(userId), Number(movieId), comment);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: "Failed to update comment" });
        }
    },

    async getMovieWatchlist(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        try {
            const { userId } = req.params;
            const watchlist = await MovieService.getMovieWatchlist(Number(userId));
            return res.json(watchlist);
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch watchlist" });
        }
    },

    async deleteMovieFromWatchlist(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        try {
            const { userId } = req.params;
            const { movieId } = req.body;
            const result = await MovieService.deleteMovieFromWatchlist(Number(userId), Number(movieId));
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: "Failed to delete movie from watchlist" });
        }
    },
};