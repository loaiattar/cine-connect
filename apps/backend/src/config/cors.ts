/**
 * CORS allowlist from env. Used by Express and Socket.io so both validate origins consistently.
 * - CORS_ORIGINS (comma-separated) or FRONTEND_ORIGIN
 * - In production with no origins set, no origin is allowed.
 * - In non-production with no origins set, Socket.io allows any (development).
 */
export function getCorsAllowlist(): string[] {
  const fromList =
    process.env.CORS_ORIGINS?.split(',')
      ?.map((s) => s.trim())
      .filter(Boolean) ?? [];
  const single = process.env.FRONTEND_ORIGIN?.trim();
  const allowlist = fromList.length > 0 ? fromList : single ? [single] : [];
  return [...new Set(allowlist)];
}
