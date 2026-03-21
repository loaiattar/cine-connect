export const ApiClientConfig = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
} as const;

import { useAuthStore } from '../stores/auth.store';
import { updateSocketAuth } from './socket';

export const HttpMethod = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

export interface ApiRequestError {
    status: number;
    message: string;
    data: unknown;
}

function parseFailureMessage(json: unknown, statusText: string): string {
    if (json && typeof json === 'object' && json !== null) {
        const o = json as Record<string, unknown>;
        if (typeof o.error === 'string') return o.error;
        if (typeof o.message === 'string') return o.message;
    }
    return `API Error: ${statusText}`;
}

/** Avoid refresh loop on auth endpoints that return 401 for wrong credentials. */
function shouldTryRefreshOn401(endpoint: string): boolean {
    const path = endpoint.split('?')[0];
    return (
        path !== '/api/auth/login' &&
        path !== '/api/auth/register' &&
        path !== '/api/auth/refresh'
    );
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
    if (refreshInFlight) {
        return refreshInFlight;
    }
    const p = (async (): Promise<boolean> => {
        try {
            const { refreshToken, user } = useAuthStore.getState();
            if (refreshToken == null || refreshToken === '' || !user) return false;

            const res = await fetch(`${ApiClientConfig.BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            const json: unknown = await res.json().catch(() => null);

            if (!res.ok || !json || typeof json !== 'object' || json === null || !('success' in json)) {
                return false;
            }
            const o = json as Record<string, unknown>;
            if (o.success !== true || !o.data || typeof o.data !== 'object' || o.data === null) {
                return false;
            }
            const d = o.data as Record<string, unknown>;
            if (typeof d.token !== 'string' || typeof d.refreshToken !== 'string') return false;
            const uid = typeof d.userId === 'number' ? d.userId : Number(d.userId);
            const email = typeof d.email === 'string' ? d.email : '';
            useAuthStore.getState().setAuth(d.token, d.refreshToken, { userId: uid, email });
            updateSocketAuth();
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

    constructor(baseUrl: string = ApiClientConfig.BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Returns unwrapped `data` from `{ success: true, data }`.
     * On 401, attempts one refresh-token rotation and retries the request once.
     */
    async request<T>(
        endpoint: string,
        method: HttpMethod = HttpMethod.GET,
        body?: unknown,
        headers: Record<string, string> = {},
        retriedAfterRefresh = false
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const token = useAuthStore.getState().token;
        const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
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
                if (typeof window !== 'undefined' && window.location.pathname !== '/LoginPage') {
                    window.location.href = '/LoginPage';
                }
            }
            throw {
                status: response.status,
                message: parseFailureMessage(json, response.statusText),
                data: json,
            } as ApiRequestError;
        }

        if (response.status === 204) {
            return {} as T;
        }

        if (json && typeof json === 'object' && json !== null && 'success' in json) {
            const o = json as Record<string, unknown>;
            if (o.success === true && 'data' in o) {
                return o.data as T;
            }
            if (o.success === false && typeof o.error === 'string') {
                throw {
                    status: response.status,
                    message: o.error,
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
