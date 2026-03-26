import { ApiClientConfig } from "../lib/api-origin";
import { parseApiEnvelope, userMessageFromApiJson } from "../lib/normalize-api-error";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

/** Public session fields only; JWTs are httpOnly cookies set by the API. */
export interface AuthSessionResponse {
  userId: number;
  email: string;
}

export interface AuthError {
  status: number;
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

const baseUrl = ApiClientConfig.BASE_URL;

export const authService = {
  /**
   * If a valid `cc_refresh` cookie exists, rotates tokens and returns session payload.
   * Used on app load when Zustand has no user yet.
   */
  async restoreSession(): Promise<AuthSessionResponse | null> {
    try {
      const res = await fetch(`${baseUrl}${ApiClientConfig.API_V1_PREFIX}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return null;
      const parsed = parseApiEnvelope(body);
      if (!parsed.ok) return null;
      const d = parsed.data as Record<string, unknown>;
      const userId = typeof d.userId === "number" ? d.userId : Number(d.userId);
      const email = typeof d.email === "string" ? d.email : "";
      if (!Number.isFinite(userId) || !email) return null;
      return { userId, email };
    } catch {
      return null;
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthSessionResponse> {
    const res = await fetch(`${baseUrl}${ApiClientConfig.API_V1_PREFIX}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        res.status === 401
          ? "Identifiants incorrects"
          : userMessageFromApiJson(body, res.status);
      throw { status: res.status, message } as AuthError;
    }

    const parsed = parseApiEnvelope(body);
    if (!parsed.ok) {
      throw { status: res.status, message: parsed.error } as AuthError;
    }
    return parsed.data as AuthSessionResponse;
  },

  async register(credentials: RegisterCredentials): Promise<AuthSessionResponse> {
    const res = await fetch(`${baseUrl}${ApiClientConfig.API_V1_PREFIX}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = userMessageFromApiJson(body, res.status);
      throw { status: res.status, message, data: body } as AuthError & { data?: unknown };
    }

    const parsed = parseApiEnvelope(body);
    if (!parsed.ok) {
      throw { status: res.status, message: parsed.error } as AuthError;
    }
    return parsed.data as AuthSessionResponse;
  },

  async logout(): Promise<void> {
    await fetch(`${baseUrl}${ApiClientConfig.API_V1_PREFIX}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).catch(() => undefined);
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    const res = await fetch(`${baseUrl}${ApiClientConfig.API_V1_PREFIX}/auth/forgot-password`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw { status: res.status, message: userMessageFromApiJson(body, res.status) } as AuthError;
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    const res = await fetch(`${baseUrl}${ApiClientConfig.API_V1_PREFIX}/auth/reset-password`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw { status: res.status, message: userMessageFromApiJson(body, res.status) } as AuthError;
    }
  },
};
