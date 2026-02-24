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

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
}
