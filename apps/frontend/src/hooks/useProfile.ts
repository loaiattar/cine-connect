import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  userService,
  type GetMeResponse,
  type UserProfileRow,
  type UpdateProfilePayload,
} from "@/service/user.service";
import { useAuth } from "@/hooks/useAuth";

/** Unwrap GET /api/users/me response (direct payload or ApiResponse envelope). */
function unwrapMe(raw: unknown): GetMeResponse | null {
  if (raw == null) return null;
  if (typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    return d != null && typeof d === "object" && "user" in d ? (d as GetMeResponse) : null;
  }
  if (typeof raw === "object" && "user" in raw && "profile" in raw) return raw as GetMeResponse;
  return null;
}

export interface UseProfileReturn {
  user: GetMeResponse["user"] | null;
  profile: UserProfileRow | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  updateProfile: (data: UpdateProfilePayload) => void;
  isUpdating: boolean;
  updateError: Error | null;
  isCurrentUser: boolean;
}

/**
 * Fetches profile by user: when userId is omitted or equals the current user,
 * fetches GET /api/users/me and exposes updateProfile. For another user's public
 * profile, the backend would need GET /api/users/:userId (not implemented yet).
 */
export function useProfile(userId?: number | null): UseProfileReturn {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const isSelf = userId == null || userId === authUser?.userId;
  const enabled = authUser != null && isSelf;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user", "me", authUser?.userId],
    queryFn: () => userService.getMe(),
    enabled,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfilePayload) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me", authUser?.userId] });
    },
  });

  const updateProfile = useCallback(
    (data: UpdateProfilePayload) => {
      updateMutation.mutate(data);
    },
    [updateMutation]
  );

  const me = unwrapMe(rawData);
  const updateError =
    updateMutation.error instanceof Error
      ? updateMutation.error
      : updateMutation.error != null &&
          typeof updateMutation.error === "object" &&
          "message" in updateMutation.error
        ? new Error(String((updateMutation.error as { message: string }).message))
        : updateMutation.error != null
          ? new Error(String(updateMutation.error))
          : null;

  return {
    user: me?.user ?? null,
    profile: me?.profile ?? null,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
    updateProfile,
    isUpdating: updateMutation.isPending,
    updateError,
    isCurrentUser: isSelf,
  };
}
