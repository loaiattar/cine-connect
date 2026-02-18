import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";

const router: Router = Router();

// GET /api/movies/:imdbId
router.get("/:imdbId", MovieController.getMovieDetails);
// POST /api/movies/favorite
router.post("/favorite", MovieController.handleToggleFavorite);
// GET /api/movies/favorites/:userId
router.get("/favorites/:userId", MovieController.getUserFavorites);
// POST /api/movies/watchlist
router.post("/watchlist", MovieController.addToWatchlist);
// GET /api/movies/comments/:movieId
router.get("/comments/:movieId", MovieController.getMovieComments);
// POST /api/movies/comments
router.post("/comments", MovieController.addComment);
// DELETE /api/movies/comments
router.delete("/comments", MovieController.deleteComment);
// PUT /api/movies/comments
router.put("/comments", MovieController.updateComment);
// GET /api/movies/watchlist/:userId
router.get("/watchlist/:userId", MovieController.getMovieWatchlist);
// DELETE /api/movies/watchlist
router.delete("/watchlist", MovieController.deleteMovieFromWatchlist);

export default router;