import { useAuthStore } from "../stores/auth.store";
import { userMessageFromApiJson } from "./normalize-api-error";
import { ApiClientConfig, resolveApiBaseUrl } from "./api-origin";

export { ApiClientConfig, resolveApiBaseUrl } from "./api-origin";

/**
 * Maps `/api/...` paths to `/api/v1/...`. Leaves paths already under `API_V1_PREFIX` unchanged.
 */
export function resolveVersionedApiPath(endpoint: string): string {
  const q = endpoint.indexOf("?");
  const pathPart = q >= 0 ? endpoint.slice(0, q) : endpoint;
  const query = q >= 0 ? endpoint.slice(q) : "";
  const { API_V1_PREFIX } = ApiClientConfig;
  if (pathPart === API_V1_PREFIX || pathPart.startsWith(`${API_V1_PREFIX}/`)) {
    return endpoint;
  }
  if (pathPart.startsWith("/api/")) {
    return `${API_V1_PREFIX}${pathPart.slice("/api".length)}${query}`;
  }
  const p = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  return `${API_V1_PREFIX}${p}${query}`;
}

export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

export interface ApiRequestError {
  status: number;
  message: string;
  data: unknown;
}

function parseFailureMessage(json: unknown, status: number, statusText: string): string {
  return userMessageFromApiJson(json, status, statusText);
}

/** Avoid refresh loop on auth endpoints that return 401 for wrong credentials. */
function shouldTryRefreshOn401(endpoint: string): boolean {
  const path = resolveVersionedApiPath(endpoint.split("?")[0]);
  return (
    path !== `${ApiClientConfig.API_V1_PREFIX}/auth/login` &&
    path !== `${ApiClientConfig.API_V1_PREFIX}/auth/register` &&
    path !== `${ApiClientConfig.API_V1_PREFIX}/auth/refresh`
  );
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  const p = (async (): Promise<boolean> => {
    try {
      const base = ApiClientConfig.BASE_URL;
      const res = await fetch(`${base}${ApiClientConfig.API_V1_PREFIX}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const json: unknown = await res.json().catch(() => null);

      if (!res.ok || !json || typeof json !== "object" || json === null || !("success" in json)) {
        return false;
      }
      const o = json as Record<string, unknown>;
      if (o.success !== true || !o.data || typeof o.data !== "object" || o.data === null) {
        return false;
      }
      const d = o.data as Record<string, unknown>;
      const uid = typeof d.userId === "number" ? d.userId : Number(d.userId);
      const email = typeof d.email === "string" ? d.email : "";
      if (!Number.isFinite(uid) || !email) return false;
      useAuthStore.getState().setUser({ userId: uid, email });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  refreshInFlight = p;
  return p;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = resolveApiBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  /**
   * Returns unwrapped `data` from `{ success: true, data }`.
   * On 401, attempts one cookie-based refresh and retries the request once.
   */
  async request<T>(
    endpoint: string,
    method: HttpMethod = HttpMethod.GET,
    body?: unknown,
    headers: Record<string, string> = {},
    retriedAfterRefresh = false
  ): Promise<T> {
    const url = `${this.baseUrl}${resolveVersionedApiPath(endpoint)}`;

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const requestHeaders: Record<string, string> = isFormData
      ? { ...headers }
      : {
          "Content-Type": "application/json",
          ...headers,
        };

    const config: RequestInit = {
      method,
      credentials: "include",
      headers: requestHeaders,
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    };

    const response = await fetch(url, config);
    const json: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      if (
        response.status === 401 &&
        !retriedAfterRefresh &&
        shouldTryRefreshOn401(endpoint)
      ) {
        const refreshed = await tryRefreshSession();
        if (refreshed) {
          return this.request<T>(endpoint, method, body, headers, true);
        }
      }

      if (response.status === 401) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      throw {
        status: response.status,
        message: parseFailureMessage(json, response.status, response.statusText),
        data: json,
      } as ApiRequestError;
    }

    if (response.status === 204) {
      return {} as T;
    }

    if (json && typeof json === "object" && json !== null && "success" in json) {
      const o = json as Record<string, unknown>;
      if (o.success === true && "data" in o) {
        return o.data as T;
      }
      if (o.success === false && typeof o.error === "string") {
        throw {
          status: response.status,
          message: userMessageFromApiJson(json, response.status, response.statusText),
          data: json,
        } as ApiRequestError;
      }
    }

    return json as T;
  }

  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, HttpMethod.GET, undefined, headers);
  }

  post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, HttpMethod.POST, body, headers);
  }

  put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, HttpMethod.PUT, body, headers);
  }

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, HttpMethod.DELETE, undefined, headers);
  }

  patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, HttpMethod.PATCH, body, headers);
  }
}

export const apiClient = new ApiClient();
