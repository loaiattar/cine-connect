import { Request, Response } from "express";
import { MovieService } from "../services/movie.service";
import { ToggleFavoriteRequest } from "@cine-connect/shared";

export const MovieController = {
    async handleToggleFavorite(req: Request, res: Response) {
        try {
            const { movieId } = req.body;
            const userId = req.user?.userId;
            console.log("test", userId, movieId);

            if (!userId || !movieId) {
                return res.status(400).json({ error: "Missing userId or movieId" });
            }

            const result = await MovieService.toggleFavorite(userId, movieId);
            return res.json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error("test", message);
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async getMovieDetails(req: Request<{ imdbId: string }>, res: Response) {
        const { imdbId } = req.params;
        const userId = req.query.userId ? Number(req.query.userId) : undefined;

        const movie = await MovieService.getMovieById(Number(imdbId), userId);
        return res.json(movie);
    },

    async getUserFavorites(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        try {
            const { userId } = req.params;
            const authenticatedUserId = req.user?.userId;

            if (Number(userId) !== authenticatedUserId) {
                return res.status(403).json({
                    error: "Unauthorized access: You can only view your own favorites"
                });
            }
            const favorites = await MovieService.getUserFavorites(Number(userId));
            return res.json(favorites);
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch favorites" });
        }
    },

    async addToWatchlist(
        req: Request,
        res: Response
    ) {
        try {
            const userId = req.user?.userId;
            const { movieId } = req.body;
            const result = await MovieService.toggleWatchlist(Number(userId), Number(movieId));
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
        req: Request,
        res: Response
    ) {
        try {
            const userId = req.user?.userId;
            const { movieId, comment } = req.body;
            const result = await MovieService.addComment(Number(userId), Number(movieId), comment);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: "Failed to add comment" });
        }
    },

    async deleteComment(
        req: Request<{ commentId: string }>,
        res: Response
    ) {
        try {
            const userId = req.user?.userId;
            const { commentId } = req.params;
            const result = await MovieService.deleteComment(Number(userId), Number(commentId));

            if (result.action === "unauthorized") {
                return res.status(403).json({ error: "You can only delete your own comments" });
            }
            if (result.action === "not_found") {
                return res.status(404).json({ error: "Comment not found" });
            }

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: "Failed to delete comment" });
        }
    },

    async updateComment(
        req: Request<{ commentId: string }>,
        res: Response
    ) {
        try {
            const userId = req.user?.userId;
            const { commentId } = req.params;
            const { comment } = req.body;
            const result = await MovieService.updateComment(Number(userId), Number(commentId), comment);

            if (result.action === "unauthorized") {
                return res.status(403).json({ error: "You can only update your own comments" });
            }
            if (result.action === "not_found") {
                return res.status(404).json({ error: "Comment not found" });
            }

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
            const authenticatedUserId = req.user?.userId;

            if (Number(userId) !== authenticatedUserId) {
                return res.status(403).json({
                    error: "Unauthorized access: You can only view your own watchlist"
                });
            }
            const watchlist = await MovieService.getMovieWatchlist(Number(userId));
            return res.json(watchlist);
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch watchlist" });
        }
    },

    async deleteMovieFromWatchlist(
        req: Request<{ movieId: string }>,
        res: Response
    ) {
        try {
            const { movieId } = req.params;
            const userId = req.user?.userId;
            if (!userId || !movieId) {
                return res.status(400).json({ error: "Missing userId or movieId" });
            }
            const result = await MovieService.deleteMovieFromWatchlist(
                Number(userId),
                Number(movieId)
            );
            return res.json(result);
        } catch (error) {
            console.error("Delete Watchlist Error:", error);
            return res.status(500).json({ error: "Failed to delete movie from watchlist" });
        }
    },
};