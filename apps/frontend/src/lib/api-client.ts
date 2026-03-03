export const ApiClientConfig = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
} as const;

import type { ApiResponse } from '@cine-connect/shared';
import { useAuthStore } from '../stores/auth.store';

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

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = ApiClientConfig.BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async request<T>(endpoint: string, method: HttpMethod = HttpMethod.GET, body?: unknown, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
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

        if (!response.ok) {
            if (response.status === 401) {
                useAuthStore.getState().clearAuth();
                window.location.href = '/LoginPage';
            }
            const errorBody = await response.json().catch(() => ({}));
            throw {
                status: response.status,
                message: errorBody.message || errorBody.error || `API Error: ${response.statusText}`,
                data: errorBody
            } as ApiRequestError;
        }

        if (response.status === 204) {
            return {
                success: true,
                data: {} as T,
            };
        }

        return (await response.json()) as ApiResponse<T>;
    }

    get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, HttpMethod.GET, undefined, headers);
    }

    post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, HttpMethod.POST, body, headers);
    }

    put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, HttpMethod.PUT, body, headers);
    }

    delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, HttpMethod.DELETE, undefined, headers);
    }
}

export const apiClient = new ApiClient();