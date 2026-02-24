/**
 * Application error with optional HTTP status.
 * Use in services; controllers map to JSON response.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** Create a 400 Bad Request error */
export function badRequest(message: string): AppError {
  return new AppError(message, 400);
}

/** Create a 401 Unauthorized error */
export function unauthorized(message: string = 'Unauthorized'): AppError {
  return new AppError(message, 401);
}

/** Create a 403 Forbidden error */
export function forbidden(message: string = 'Forbidden'): AppError {
  return new AppError(message, 403);
}

/** Create a 404 Not Found error */
export function notFound(message: string = 'Not found'): AppError {
  return new AppError(message, 404);
}

/** Create a 409 Conflict error */
export function conflict(message: string = 'Conflict'): AppError {
  return new AppError(message, 409);
}
