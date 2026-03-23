import { ApiClientConfig } from "../lib/api-origin";

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
      const parsed = parseEnvelope(body);
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
    return parsed.data as AuthSessionResponse;
  },

  async logout(): Promise<void> {
    await fetch(`${baseUrl}${ApiClientConfig.API_V1_PREFIX}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).catch(() => undefined);
  },
};
