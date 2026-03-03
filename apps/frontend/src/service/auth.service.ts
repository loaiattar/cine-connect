import { ApiClientConfig } from "../lib/api-client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
}

export interface AuthError {
  status: number;
  message: string;
}

const baseUrl = ApiClientConfig.BASE_URL;

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        res.status === 401
          ? "Identifiants incorrects"
          : (body.error as string) || `Erreur ${res.status}`;
      throw { status: res.status, message } as AuthError;
    }

    return body as AuthResponse;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        res.status === 409
          ? "Cet email est déjà utilisé."
          : res.status === 400
            ? ((body.message as string) || (body.errors as { message?: string }[])?.[0]?.message) ?? "Données invalides."
            : (body.error as string) || `Erreur ${res.status}`;
      throw { status: res.status, message, data: body } as AuthError & { data?: unknown };
    }

    return body as AuthResponse;
  },
};
