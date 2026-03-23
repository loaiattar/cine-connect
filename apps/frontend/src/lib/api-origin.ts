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

/** Socket.io and HTTP API share the same host in dev (Vite proxy) or production. */
export function socketHttpOrigin(): string {
  const base = resolveApiBaseUrl().replace(/\/$/, "");
  if (base) return base;
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}
