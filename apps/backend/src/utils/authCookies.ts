import type { CookieOptions, Request, Response } from "express";

/** httpOnly access JWT (short-lived). */
export const COOKIE_ACCESS = "cc_access";
/** httpOnly refresh token (rotation). */
export const COOKIE_REFRESH = "cc_refresh";

function accessCookieMaxAgeMs(): number {
  const raw = process.env.JWT_ACCESS_EXPIRES_SECONDS?.trim();
  if (raw && /^\d+$/.test(raw)) {
    return parseInt(raw, 10) * 1000;
  }
  return 15 * 60 * 1000;
}

const REFRESH_COOKIE_MAX_MS = 7 * 24 * 60 * 60 * 1000;

function authCookieSameSite(): CookieOptions["sameSite"] {
  const raw = process.env.AUTH_COOKIE_SAME_SITE?.trim().toLowerCase();
  if (raw === "none" || raw === "lax" || raw === "strict") {
    return raw;
  }
  return "lax";
}

export function authCookieBaseOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  const sameSite = authCookieSameSite();
  // SameSite=None is rejected unless Secure is set.
  const secure = isProd || sameSite === "none";
  const base: CookieOptions & { partitioned?: boolean } = {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };
  // CHIPS: without Partitioned, Firefox/Chrome often drop cross-site cookies on fetch from the SPA
  // (e.g. separate *.run.app front/back). Requires SameSite=None + Secure.
  if (sameSite === "none") {
    base.partitioned = true;
  }
  return base;
}

export function attachAuthCookies(
  res: Response,
  accessToken: string,
  refreshTokenPlain: string
): void {
  const base = authCookieBaseOptions();
  res.cookie(COOKIE_ACCESS, accessToken, {
    ...base,
    maxAge: accessCookieMaxAgeMs(),
  });
  res.cookie(COOKIE_REFRESH, refreshTokenPlain, {
    ...base,
    maxAge: REFRESH_COOKIE_MAX_MS,
  });
}

export function clearAuthCookies(res: Response): void {
  const base = authCookieBaseOptions();
  res.clearCookie(COOKIE_ACCESS, { path: "/", ...base });
  res.clearCookie(COOKIE_REFRESH, { path: "/", ...base });
}

export function getRefreshTokenFromRequest(req: Request): string | undefined {
  const v = req.cookies?.[COOKIE_REFRESH];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function getAccessTokenFromRequest(req: Request): string | undefined {
  const fromCookie = req.cookies?.[COOKIE_ACCESS];
  if (typeof fromCookie === "string" && fromCookie.length > 0) {
    return fromCookie;
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim() || undefined;
  }
  return undefined;
}
