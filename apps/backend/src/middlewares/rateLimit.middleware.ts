import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

/**
 * Strict rate limit for auth endpoints (login/register) to reduce brute-force and abuse.
 * 10 requests per minute per IP; disabled in test so suites don't get throttled.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 10000 : 10,
  message: { error: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Optional: looser limit for the rest of the API (e.g. 100/min per IP).
 * Apply to app or specific routers if desired.
 */
export const generalApiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 10000 : 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
