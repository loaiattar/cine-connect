import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";
const FIFTEEN_MIN_MS = 15 * 60 * 1000;

/**
 * Baseline limiter for all API routes (/api/v1/*).
 * Keeps broad abuse in check while allowing normal client usage.
 */
export const generalApiRateLimiter = rateLimit({
  windowMs: FIFTEEN_MIN_MS,
  max: isTest ? 10000 : 300,
  message: { success: false, error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

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

/** Forgot-password endpoint limiter to reduce account enumeration/abuse. */
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: FIFTEEN_MIN_MS,
  max: isTest ? 10000 : 5,
  message: { success: false, error: "Too many password reset requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
