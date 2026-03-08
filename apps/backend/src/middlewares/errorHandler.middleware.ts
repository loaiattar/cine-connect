import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils";

type AsyncRequestHandler<P = Record<string, string>> = (
  req: Request<P>,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps async route handlers so rejections are forwarded to next(err)
 * and the global error handler can respond with JSON.
 */
export function asyncHandler<P = Record<string, string>>(
  fn: AsyncRequestHandler<P>
) {
  return (req: Request<P>, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Central error-handling middleware (4-arg signature so Express recognizes it).
 * - AppError: returns err.statusCode and err.message as JSON.
 * - Other errors: log and return 500 with a generic message.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) {
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Database connection refused (PostgreSQL not running or wrong DATABASE_URL)
  const cause = err && typeof err === "object" && "cause" in err ? (err as { cause: unknown }).cause : null;
  let code: string | null = null;
  if (cause && typeof cause === "object") {
    if ("code" in cause && typeof (cause as { code: unknown }).code === "string") code = (cause as { code: string }).code;
    else if ("errors" in cause && Array.isArray((cause as { errors: unknown[] }).errors)) {
      const first = (cause as { errors: unknown[] }).errors[0];
      if (first && typeof first === "object" && "code" in first) code = String((first as { code: unknown }).code);
    }
  }
  if (code === "ECONNREFUSED") {
    console.error("Database connection refused. Is PostgreSQL running? Check DATABASE_URL in .env:", err);
    res.status(503).json({
      error: "Service temporarily unavailable. Database connection failed. Check that PostgreSQL is running and DATABASE_URL is correct.",
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
}
