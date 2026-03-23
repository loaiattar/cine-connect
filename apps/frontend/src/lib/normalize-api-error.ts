/**
 * Shared parsing and user-facing messages for API envelopes `{ success, error, errors }`
 * and thrown API error objects from the shared `apiClient` (status + message + optional JSON body).
 */

export type ParsedApiEnvelope =
  | { ok: true; data: unknown }
  | { ok: false; error: string; errors?: unknown };

/** Maps `/api/v1/...` JSON bodies that use the standard envelope. */
export function parseApiEnvelope(json: unknown): ParsedApiEnvelope {
  if (json && typeof json === "object" && json !== null && "success" in json) {
    const o = json as Record<string, unknown>;
    if (o.success === true && "data" in o) return { ok: true, data: o.data };
    if (o.success === false && typeof o.error === "string") {
      return { ok: false, error: o.error, errors: o.errors };
    }
  }
  return { ok: false, error: "Réponse invalide du serveur." };
}

function firstValidationMessage(json: unknown): string | null {
  if (!json || typeof json !== "object" || json === null) return null;
  const errors = (json as Record<string, unknown>).errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;
  const first = errors[0];
  if (first && typeof first === "object" && first !== null) {
    const m = (first as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return null;
}

function topLevelErrorString(json: unknown): string | null {
  if (!json || typeof json !== "object" || json === null) return null;
  const o = json as Record<string, unknown>;
  if (typeof o.error === "string" && o.error.trim()) return o.error;
  if (typeof o.message === "string" && o.message.trim()) return o.message;
  return null;
}

/** Known English API strings → French copy used across the app. */
function translateCommonApiMessage(msg: string): string {
  const t = msg.trim();
  if (t === "Email already registered") return "Cet email est déjà utilisé.";
  if (/^Unauthorized/i.test(t)) return "Non autorisé.";
  return t;
}

/**
 * Single string to show for an HTTP error body and status (validation vs auth vs generic).
 */
export function userMessageFromApiJson(
  json: unknown,
  status: number,
  statusText = ""
): string {
  if (status === 400) {
    const vm = firstValidationMessage(json);
    if (vm) return vm;
    const top = topLevelErrorString(json);
    if (top) return translateCommonApiMessage(top);
    return "Données invalides.";
  }

  if (status === 401) {
    const top = topLevelErrorString(json);
    if (top) return translateCommonApiMessage(top);
    return "Non autorisé.";
  }

  if (status === 403) {
    return translateCommonApiMessage(topLevelErrorString(json) || "Accès refusé.");
  }

  if (status === 409) {
    return translateCommonApiMessage(topLevelErrorString(json) || "Conflit.");
  }

  if (status >= 500) {
    return translateCommonApiMessage(
      topLevelErrorString(json) || "Erreur serveur. Réessayez plus tard."
    );
  }

  const top = topLevelErrorString(json);
  if (top) return translateCommonApiMessage(top);

  const fallback = statusText.trim() ? `Erreur ${status} (${statusText})` : `Erreur ${status}`;
  return status >= 400 ? fallback : "Une erreur s'est produite.";
}

export type NormalizedApiErrorKind =
  | "validation"
  | "auth"
  | "forbidden"
  | "conflict"
  | "server"
  | "client"
  | "unknown";

export interface NormalizedApiError {
  message: string;
  status: number | null;
  kind: NormalizedApiErrorKind;
}

function kindFromStatus(status: number): NormalizedApiErrorKind {
  if (status === 400) return "validation";
  if (status === 401) return "auth";
  if (status === 403) return "forbidden";
  if (status === 409) return "conflict";
  if (status >= 500) return "server";
  if (status >= 400) return "client";
  return "unknown";
}

function isApiRequestLike(
  err: unknown
): err is { status: number; message?: unknown; data?: unknown } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  );
}

/**
 * Normalizes unknown thrown values (e.g. React Query errors) for display and logging.
 */
export function normalizeApiError(err: unknown): NormalizedApiError {
  if (err == null) {
    return { message: "Une erreur s'est produite.", status: null, kind: "unknown" };
  }

  if (isApiRequestLike(err)) {
    const message =
      err.data != null
        ? userMessageFromApiJson(err.data, err.status)
        : typeof err.message === "string" && err.message.trim()
          ? translateCommonApiMessage(err.message)
          : userMessageFromApiJson(null, err.status);
    return {
      message,
      status: err.status,
      kind: kindFromStatus(err.status),
    };
  }

  if (err instanceof Error) {
    return { message: err.message, status: null, kind: "unknown" };
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === "string" && m.trim()) {
      return { message: m, status: null, kind: "unknown" };
    }
  }

  return { message: String(err), status: null, kind: "unknown" };
}

/** Turns a React Query (or mutation) error into `Error` with a normalized message. */
export function toDisplayError(error: unknown): Error | null {
  if (error == null) return null;
  if (error instanceof Error) return error;
  const { message } = normalizeApiError(error);
  return new Error(message);
}

/** Pattern: query `isError` + `error` → `Error | null` for hook return values. */
export function toQueryError(isError: boolean, error: unknown): Error | null {
  if (!isError || error == null) return null;
  return toDisplayError(error);
}
