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
  refreshToken: string;
  userId: number;
  email: string;
}

export interface AuthError {
  status: number;
  message: string;
}

const baseUrl = ApiClientConfig.BASE_URL;

function parseEnvelope(json: unknown): { ok: true; data: unknown } | { ok: false; error: string; errors?: unknown } {
  if (json && typeof json === "object" && json !== null && "success" in json) {
    const o = json as Record<string, unknown>;
    if (o.success === true && "data" in o) return { ok: true, data: o.data };
    if (o.success === false && typeof o.error === "string") {
      return { ok: false, error: o.error, errors: o.errors };
    }
  }
  return { ok: false, error: "Réponse invalide du serveur." };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const parsed = parseEnvelope(body);
      const message =
        res.status === 401
          ? "Identifiants incorrects"
          : parsed.ok
            ? `Erreur ${res.status}`
            : parsed.error || `Erreur ${res.status}`;
      throw { status: res.status, message } as AuthError;
    }

    const parsed = parseEnvelope(body);
    if (!parsed.ok) {
      throw { status: res.status, message: parsed.error } as AuthError;
    }
    return parsed.data as AuthResponse;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const parsed = parseEnvelope(body);
      let message: string;
      if (res.status === 409) {
        message = "Cet email est déjà utilisé.";
      } else if (res.status === 400) {
        const errs = parsed.ok ? undefined : (parsed.errors as Array<{ message?: string }> | undefined);
        message =
          (!parsed.ok && parsed.error) ||
          errs?.[0]?.message ||
          "Données invalides.";
      } else {
        message = !parsed.ok ? parsed.error : `Erreur ${res.status}`;
      }
      throw { status: res.status, message, data: body } as AuthError & { data?: unknown };
    }

    const parsed = parseEnvelope(body);
    if (!parsed.ok) {
      throw { status: res.status, message: parsed.error } as AuthError;
    }
    return parsed.data as AuthResponse;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const res = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const parsed = parseEnvelope(body);
      throw {
        status: res.status,
        message: !parsed.ok ? parsed.error : `Erreur ${res.status}`,
      } as AuthError;
    }

    const parsed = parseEnvelope(body);
    if (!parsed.ok) {
      throw { status: res.status, message: parsed.error } as AuthError;
    }
    return parsed.data as AuthResponse;
  },
};
