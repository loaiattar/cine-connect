import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

/**
 * Strict rate limit for auth endpoints (login/register) to reduce brute-force and abuse.
 * 10 requests per minute per IP; disabled in test so suites don't get throttled.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 10000 : 10,
  message: { success: false, error: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const FIFTEEN_MIN_MS = 15 * 60 * 1000;

/**
 * Public / read-heavy movie routes (TMDB + DB reads): 100 requests per 15 minutes per IP.
 * Returns 429 with JSON body when exceeded (express-rate-limit default status).
 */
export const publicMovieReadRateLimiter = rateLimit({
  windowMs: FIFTEEN_MIN_MS,
  max: isTest ? 10000 : 100,
  message: { success: false, error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
