/**
 * API origin and version prefix only — no auth store or fetch client.
 * Keeps Socket.io and other modules from importing api-client (circular deps).
 */
export function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw != null && String(raw).trim() !== "") {
    return String(raw).replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "";
  }
  return "http://localhost:3000";
}

export const ApiClientConfig = {
  get BASE_URL(): string {
    return resolveApiBaseUrl();
  },
  /** All JSON API routes are mounted under this prefix on the backend. */
  API_V1_PREFIX: "/api/v1",
} as const;

/**
 * Resolves stored avatar/media paths for `<img src>` (and similar).
 * API may return a relative path (`/uploads/avatars/...`) or an absolute URL (legacy / external).
 *
 * **Dev + proxy:** When `VITE_API_BASE_URL` is empty, `/uploads/...` stays same-origin so Vite proxies
 * it to `VITE_API_PROXY_TARGET` (must be the same backend instance that stored the file).
 *
 * **Dev + cross-origin API:** When `VITE_API_BASE_URL` is set, media uses that origin too so uploads
 * are not requested via a different proxy target than JSON API calls (which would 404 if targets differ).
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const trimmed = String(url).trim();
  if (trimmed === "") return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const base = resolveApiBaseUrl().replace(/\/$/, "");
  if (path.startsWith("/uploads/")) {
    if (base) return `${base}${path}`;
    if (import.meta.env.DEV) return path;
  }
  return base ? `${base}${path}` : path;
}

/** Socket.io and HTTP API share the same host in dev (Vite proxy) or production. */
export function socketHttpOrigin(): string {
  const base = resolveApiBaseUrl().replace(/\/$/, "");
  if (base) return base;
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}
