import { z } from "zod";

const movieIdSchema = z.string().regex(/^\d+$/).transform(Number);
const userIdSchema = z.string().regex(/^\d+$/).transform(Number);
const commentIdSchema = z.string().regex(/^\d+$/).transform(Number);

export const getMovieDetailsSchema = z.object({
    params: z.object({
        movieId: z.string().regex(/^\d+$/).transform(Number),
    }),
});

export const toggleFavoriteSchema = z.object({
    body: z.object({
        movieId: z.number().int().positive(),
    }),
});

export const getUserFavoritesSchema = z.object({
    params: z.object({
        userId: userIdSchema,
    }),
});

export const addToWatchlistSchema = z.object({
    body: z.object({
        movieId: z.number().int().positive(),
    }),
});

export const getMovieWatchlistSchema = z.object({
    params: z.object({
        userId: userIdSchema,
    }),
});

export const deleteMovieFromWatchlistSchema = z.object({
    params: z.object({
        movieId: movieIdSchema,
    }),
});

export const getMovieCommentsSchema = z.object({
    params: z.object({
        movieId: movieIdSchema,
    }),
});

export const addCommentSchema = z.object({
    body: z.object({
        movieId: z.number().int().positive(),
        comment: z.string().min(1).max(1000),
    }),
});

export const deleteCommentSchema = z.object({
    params: z.object({
        commentId: commentIdSchema,
    }),
});

export const updateCommentSchema = z.object({
    params: z.object({
        commentId: commentIdSchema,
    }),
    body: z.object({
        comment: z.string().min(1).max(1000),
    }),
});

/** Rating scale 1–10 (one per user per film, upsert). */
const RATING_MIN = 1;
const RATING_MAX = 10;

export const submitRatingSchema = z.object({
    body: z.object({
        movieId: z.number().int().positive(),
        rating: z.number().int().min(RATING_MIN).max(RATING_MAX),
    }),
});

export const getMovieRatingSchema = z.object({
    params: z.object({
        movieId: movieIdSchema,
    }),
});

/** GET /api/movies/search — q required; page and genre optional */
export const getMoviesSearchSchema = z.object({
    query: z.object({
        q: z.string().min(1, "Search query is required"),
        page: z
            .string()
            .optional()
            .transform((v) => (v != null ? parseInt(v, 10) : 1))
            .pipe(z.number().int().positive()),
        genre: z
            .string()
            .optional()
            .transform((v) => (v != null ? parseInt(v, 10) : undefined))
            .pipe(z.number().int().positive().optional()),
    }),
});
