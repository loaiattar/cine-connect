import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

// GET /api/movies/:imdbId
router.get("/:imdbId", authMiddleware, MovieController.getMovieDetails);
// POST /api/movies/favorite
router.post("/favorite", authMiddleware, MovieController.handleToggleFavorite);
// GET /api/movies/favorites/:userId
router.get("/favorites/:userId", authMiddleware, MovieController.getUserFavorites);
// POST /api/movies/watchlist
router.post("/watchlist", authMiddleware, MovieController.addToWatchlist);
// GET /api/movies/watchlist/:userId
router.get("/watchlist/:userId", authMiddleware, MovieController.getMovieWatchlist);
// DELETE /api/movies/watchlist/:movieId
router.delete("/watchlist/:movieId", authMiddleware, MovieController.deleteMovieFromWatchlist);
// GET /api/movies/comments/:movieId
router.get("/comments/:movieId", MovieController.getMovieComments);
// POST /api/movies/comments
router.post("/comments", authMiddleware, MovieController.addComment);
// DELETE /api/movies/comments
router.delete("/comments", authMiddleware, MovieController.deleteComment);
// PUT /api/movies/comments
router.put("/comments", authMiddleware, MovieController.updateComment);

export default router;