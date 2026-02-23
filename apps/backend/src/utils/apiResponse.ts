import { Response } from 'express';

/** Standard success JSON payload */
export function success<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json(data);
}

/** Standard error JSON payload */
export function error(
  res: Response,
  message: string,
  status = 500
): Response {
  return res.status(status).json({ error: message });
}

/** Optional: typed API envelope (e.g. { success, data?, error? }) */
export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function sendEnvelope<T>(
  res: Response,
  payload: ApiEnvelope<T>,
  status?: number
): Response {
  const code = status ?? (payload.success ? 200 : 500);
  return res.status(code).json(payload);
}
