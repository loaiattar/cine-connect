import { Response } from 'express';

export type ValidationIssue = { path: string; message: string };

/** Successful JSON: `{ success: true, data }` */
export function success<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json({ success: true as const, data });
}

/** Error JSON: `{ success: false, error }` (optional `errors` for validation). */
export function failure(
  res: Response,
  error: string,
  status: number,
  options?: { errors?: ValidationIssue[] }
): Response {
  const body: {
    success: false;
    error: string;
    errors?: ValidationIssue[];
  } = { success: false, error };
  if (options?.errors && options.errors.length > 0) {
    body.errors = options.errors;
  }
  return res.status(status).json(body);
}

/** @deprecated Prefer `failure` */
export function error(res: Response, message: string, status = 500): Response {
  return failure(res, message, status);
}
