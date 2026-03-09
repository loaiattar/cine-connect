import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
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
    omdbSearchSchema,
    omdbGetByIdSchema,
    omdbGetByTitleSchema,
} from "../schemas/movie.schema";

const router: Router = Router();

// ── OMDb routes (before /:movieId to avoid conflict) ────────────────────────
// GET /api/movies/omdb/search?t=title&page=1
router.get("/omdb/search", authMiddleware, validate(omdbSearchSchema), asyncHandler(MovieController.omdbSearch));
// GET /api/movies/omdb/id/:imdbId  (ex: tt1375666)
router.get("/omdb/id/:imdbId", authMiddleware, validate(omdbGetByIdSchema), asyncHandler(MovieController.omdbGetByImdbId));
// GET /api/movies/omdb/title/:title
router.get("/omdb/title/:title", authMiddleware, validate(omdbGetByTitleSchema), asyncHandler(MovieController.omdbGetByTitle));

// GET /api/movies/trending — list trending movies (TMDB)
router.get("/trending", asyncHandler(MovieController.getTrending));
// GET /api/movies/search — search movies (auth required; q, optional page, optional genre)
router.get("/search", authMiddleware, validate(getMoviesSearchSchema), asyncHandler(MovieController.searchMovies));

// More specific routes first so /rating/:movieId is not matched by /:movieId (details)
// GET /api/movies/rating/:movieId — aggregate (public) + user's rating when authenticated
router.get("/rating/:movieId", optionalAuthMiddleware, validate(getMovieRatingSchema), asyncHandler(MovieController.getMovieRating));
// POST /api/movies/rate — submit or update rating (upsert)
router.post("/rate", authMiddleware, validate(submitRatingSchema), asyncHandler(MovieController.submitRating));

// GET /api/movies/:movieId — public; optional auth adds isFavorite, isOnWatchlist, comments
router.get("/:movieId", optionalAuthMiddleware, validate(getMovieDetailsSchema), asyncHandler(MovieController.getMovieDetails));
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