import { Request, Response } from "express";
import { badRequest, forbidden, success } from "../utils";
import { MovieService } from "../services/movie";
import { getSocketIo, filmRoomId } from "../socket";

export const MovieController = {
    async getTrending(_req: Request, res: Response) {
        const data = await MovieService.getTrending();
        return success(res, data);
    },

    async searchMovies(req: Request, res: Response) {
        const q = String(req.query.q ?? "").trim();
        const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
        const genreParam = req.query.genre != null && req.query.genre !== "" ? parseInt(String(req.query.genre), 10) : undefined;
        const genre = genreParam != null && !Number.isNaN(genreParam) ? genreParam : undefined;
        const data = await MovieService.searchMovies(q, page, genre);
        return success(res, data);
    },

    async handleToggleFavorite(req: Request, res: Response) {
        const { movieId } = req.body;
        const userId = req.user?.userId;

        if (!userId || !movieId) {
            throw badRequest("Missing userId or movieId");
        }

        const result = await MovieService.toggleFavorite(userId, movieId);
        return success(res, result);
    },

    async getMovieDetails(req: Request<{ movieId: string }>, res: Response) {
        const { movieId } = req.params;
        const userId = req.user?.userId;

        const movie = await MovieService.getDetailedMovie(Number(movieId), userId);
        return success(res, movie);
    },

    async getUserFavorites(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        const { userId } = req.params;
        const authenticatedUserId = req.user?.userId;

        if (Number(userId) !== authenticatedUserId) {
            throw forbidden("Unauthorized access: You can only view your own favorites");
        }

        const favorites = await MovieService.getUserFavorites(Number(userId));
        return success(res, favorites);
    },

    async addToWatchlist(req: Request, res: Response) {
        const userId = req.user?.userId;
        const { movieId } = req.body;
        const result = await MovieService.toggleWatchlist(Number(userId), Number(movieId));
        return success(res, result);
    },

    async getMovieComments(
        req: Request<{ movieId: string }>,
        res: Response
    ) {
        const { movieId } = req.params;
        const comments = await MovieService.getMovieComments(Number(movieId));
        return success(res, comments);
    },

    async addComment(req: Request, res: Response) {
        const userId = req.user?.userId;
        const { movieId, comment } = req.body;
        const result = await MovieService.addComment(Number(userId), Number(movieId), comment);
        const io = getSocketIo();
        if (io) {
            io.to(filmRoomId(Number(movieId))).emit("movie_comment", result);
        }
        return success(res, result);
    },

    async deleteComment(
        req: Request<{ commentId: string }>,
        res: Response
    ) {
        const userId = req.user?.userId;
        const { commentId } = req.params;
        const result = await MovieService.deleteComment(Number(userId), Number(commentId));
        return success(res, result);
    },

    async updateComment(
        req: Request<{ commentId: string }>,
        res: Response
    ) {
        const userId = req.user?.userId;
        const { commentId } = req.params;
        const { comment } = req.body;
        const result = await MovieService.updateComment(Number(userId), Number(commentId), comment);
        return success(res, result);
    },

    async getMovieWatchlist(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        const { userId } = req.params;
        const authenticatedUserId = req.user?.userId;

        if (Number(userId) !== authenticatedUserId) {
            throw forbidden("Unauthorized access: You can only view your own watchlist");
        }

        const watchlist = await MovieService.getMovieWatchlist(Number(userId));
        return success(res, watchlist);
    },

    async deleteMovieFromWatchlist(
        req: Request<{ movieId: string }>,
        res: Response
    ) {
        const { movieId } = req.params;
        const userId = req.user?.userId;

        if (!userId || !movieId) {
            throw badRequest("Missing userId or movieId");
        }

        const result = await MovieService.deleteMovieFromWatchlist(
            Number(userId),
            Number(movieId)
        );
        return success(res, result);
    },

    async submitRating(req: Request, res: Response) {
        const userId = req.user?.userId;
        const { movieId, rating } = req.body;
        if (!userId) throw badRequest("Missing authentication");
        const result = await MovieService.submitRating(userId, movieId, rating);
        return success(res, result);
    },

    async getMovieRating(req: Request<{ movieId: string }>, res: Response) {
        const { movieId } = req.params;
        const userId = req.user?.userId;
        const result = await MovieService.getMovieRating(Number(movieId), userId);
        return success(res, result);
    },
};
