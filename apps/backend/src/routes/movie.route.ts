import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
    getMovieDetailsSchema,
    toggleFavoriteSchema,
    getUserFavoritesSchema,
    addToWatchlistSchema,
    getMovieWatchlistSchema,
    deleteMovieFromWatchlistSchema,
    getMovieCommentsSchema,
    addCommentSchema,
    deleteCommentSchema,
    updateCommentSchema,
} from "../schemas/movie.schema";

const router: Router = Router();

// GET /api/movies/:imdbId
router.get("/:imdbId", authMiddleware, validate(getMovieDetailsSchema), asyncHandler(MovieController.getMovieDetails));
// POST /api/movies/favorite
router.post("/favorite", authMiddleware, validate(toggleFavoriteSchema), MovieController.handleToggleFavorite);
// GET /api/movies/favorites/:userId
router.get("/favorites/:userId", authMiddleware, validate(getUserFavoritesSchema), MovieController.getUserFavorites);
// POST /api/movies/watchlist
router.post("/watchlist", authMiddleware, validate(addToWatchlistSchema), MovieController.addToWatchlist);
// GET /api/movies/watchlist/:userId
router.get("/watchlist/:userId", authMiddleware, validate(getMovieWatchlistSchema), MovieController.getMovieWatchlist);
// DELETE /api/movies/watchlist/:movieId
router.delete("/watchlist/:movieId", authMiddleware, validate(deleteMovieFromWatchlistSchema), MovieController.deleteMovieFromWatchlist);
// GET /api/movies/comments/:movieId
router.get("/comments/:movieId", validate(getMovieCommentsSchema), MovieController.getMovieComments);
// POST /api/movies/comments
router.post("/comments", authMiddleware, validate(addCommentSchema), MovieController.addComment);
// DELETE /api/movies/comments/:commentId
router.delete("/comments/:commentId", authMiddleware, validate(deleteCommentSchema), MovieController.deleteComment);
// PUT /api/movies/comments/:commentId
router.put("/comments/:commentId", authMiddleware, validate(updateCommentSchema), MovieController.updateComment);

export default router;