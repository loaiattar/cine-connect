import { useMemo } from "react";
import {
  normalizeApiError,
  toDisplayError,
  toQueryError,
  type NormalizedApiError,
} from "@/lib/normalize-api-error";

/**
 * Memoized {@link normalizeApiError} for a React Query `error` value.
 */
export function useNormalizedApiError(error: unknown): NormalizedApiError | null {
  return useMemo(
    () => (error == null ? null : normalizeApiError(error)),
    [error]
  );
}

/**
 * Memoized {@link toDisplayError} for mutations or queries that expose `Error | null`.
 */
export function useDisplayApiError(error: unknown): Error | null {
  return useMemo(() => toDisplayError(error), [error]);
}

/** React Query: only surface an error when `isError` is true. */
export function useQueryDisplayError(isError: boolean, error: unknown): Error | null {
  return useMemo(() => toQueryError(isError, error), [isError, error]);
}
