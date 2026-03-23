import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import { publicMovieReadRateLimiter } from "../middlewares/rateLimit.middleware";
import {
    getMovieDetailsSchema,
    getMoviesSearchSchema,
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

// GET /api/movies/trending — list trending movies (TMDB)
router.get("/trending", publicMovieReadRateLimiter, asyncHandler(MovieController.getTrending));
// GET /api/movies/search — search movies (auth required; q, optional page, optional genre)
router.get(
  "/search",
  publicMovieReadRateLimiter,
  authMiddleware,
  validate(getMoviesSearchSchema),
  asyncHandler(MovieController.searchMovies)
);

// More specific routes first so /rating/:movieId and /comments/:movieId are not matched by /:movieId
// GET /api/movies/rating/:movieId — aggregate (public) + user's rating when authenticated
router.get(
  "/rating/:movieId",
  publicMovieReadRateLimiter,
  optionalAuthMiddleware,
  validate(getMovieRatingSchema),
  asyncHandler(MovieController.getMovieRating)
);
// POST /api/movies/rate — submit or update rating (upsert)
router.post("/rate", authMiddleware, validate(submitRatingSchema), asyncHandler(MovieController.submitRating));

// GET /api/movies/comments/:movieId — must be before /:movieId
router.get(
  "/comments/:movieId",
  publicMovieReadRateLimiter,
  validate(getMovieCommentsSchema),
  asyncHandler(MovieController.getMovieComments)
);

// GET /api/movies/:movieId — public; optional Bearer JWT sets isFavorite / isOnWatchlist for that user only (no ?userId)
router.get(
  "/:movieId",
  publicMovieReadRateLimiter,
  optionalAuthMiddleware,
  validate(getMovieDetailsSchema),
  asyncHandler(MovieController.getMovieDetails)
);
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
// POST /api/movies/comments
router.post("/comments", authMiddleware, validate(addCommentSchema), asyncHandler(MovieController.addComment));
// DELETE /api/movies/comments/:commentId
router.delete("/comments/:commentId", authMiddleware, validate(deleteCommentSchema), asyncHandler(MovieController.deleteComment));
// PUT /api/movies/comments/:commentId
router.put("/comments/:commentId", authMiddleware, validate(updateCommentSchema), asyncHandler(MovieController.updateComment));

export default router;