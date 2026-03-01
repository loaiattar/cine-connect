import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware";
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
    submitRatingSchema,
    getMovieRatingSchema,
} from "../schemas/movie.schema";

const router: Router = Router();

// Rating: more specific routes first so /rating/:movieId is not matched by /:imdbId
// GET /api/movies/rating/:movieId — aggregate (public) + user's rating when authenticated
router.get("/rating/:movieId", optionalAuthMiddleware, validate(getMovieRatingSchema), asyncHandler(MovieController.getMovieRating));
// POST /api/movies/rate — submit or update rating (upsert)
router.post("/rate", authMiddleware, validate(submitRatingSchema), asyncHandler(MovieController.submitRating));

// GET /api/movies/:imdbId
router.get("/:imdbId", authMiddleware, validate(getMovieDetailsSchema), asyncHandler(MovieController.getMovieDetails));
// POST /api/movies/favorite
router.post("/favorite", authMiddleware, validate(toggleFavoriteSchema), asyncHandler(MovieController.handleToggleFavorite));
// GET /api/movies/favorites/:userId
router.get("/favorites/:userId", authMiddleware, validate(getUserFavoritesSchema), asyncHandler(MovieController.getUserFavorites));
// POST /api/movies/watchlist
router.post("/watchlist", authMiddleware, validate(addToWatchlistSchema), asyncHandler(MovieController.addToWatchlist));
// GET /api/movies/watchlist/:userId
router.get("/watchlist/:userId", authMiddleware, validate(getMovieWatchlistSchema), asyncHandler(MovieController.getMovieWatchlist));
// DELETE /api/movies/watchlist/:movieId
router.delete("/watchlist/:movieId", authMiddleware, validate(deleteMovieFromWatchlistSchema), asyncHandler(MovieController.deleteMovieFromWatchlist));
// GET /api/movies/comments/:movieId
router.get("/comments/:movieId", validate(getMovieCommentsSchema), asyncHandler(MovieController.getMovieComments));
// POST /api/movies/comments
router.post("/comments", authMiddleware, validate(addCommentSchema), asyncHandler(MovieController.addComment));
// DELETE /api/movies/comments/:commentId
router.delete("/comments/:commentId", authMiddleware, validate(deleteCommentSchema), asyncHandler(MovieController.deleteComment));
// PUT /api/movies/comments/:commentId
router.put("/comments/:commentId", authMiddleware, validate(updateCommentSchema), asyncHandler(MovieController.updateComment));

export default router;