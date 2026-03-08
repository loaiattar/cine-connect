import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  userService,
  type GetMeResponse,
  type GetPublicProfileResponse,
  type UserProfileRow,
  type UpdateProfilePayload,
} from "@/service/user.service";
import { useAuth } from "@/hooks/useAuth";

/** User shape returned by useProfile (me has email, public profile does not). */
export type ProfileUser = (GetMeResponse["user"] | GetPublicProfileResponse["user"]) & {
  email?: string | null;
};

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

/** Unwrap GET /api/users/:userId/profile response. */
function unwrapPublicProfile(raw: unknown): GetPublicProfileResponse | null {
  if (raw == null) return null;
  if (typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    return d != null && typeof d === "object" && "user" in d ? (d as GetPublicProfileResponse) : null;
  }
  if (typeof raw === "object" && "user" in raw && "profile" in raw) return raw as GetPublicProfileResponse;
  return null;
}

export interface UseProfileReturn {
  user: ProfileUser | null;
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
 * fetches GET /api/users/me and exposes updateProfile. For another user, fetches
 * GET /api/users/:userId/profile (public profile, no email).
 */
export function useProfile(userId?: number | null): UseProfileReturn {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const isSelf = userId == null || userId === authUser?.userId;
  const enabledMe = authUser != null && isSelf;
  const enabledPublic = userId != null && !isSelf;

  const meQuery = useQuery({
    queryKey: ["user", "me", authUser?.userId],
    queryFn: () => userService.getMe(),
    enabled: enabledMe,
  });

  const publicQuery = useQuery({
    queryKey: ["user", "profile", userId],
    queryFn: () => userService.getPublicProfile(userId!),
    enabled: enabledPublic,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfilePayload) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me", authUser?.userId] });
    },
  });

  const updateProfile = useCallback(
    (data: UpdateProfilePayload) => {
      if (isSelf) updateMutation.mutate(data);
    },
    [updateMutation, isSelf]
  );

  const me = unwrapMe(meQuery.data);
  const publicProfile = unwrapPublicProfile(publicQuery.data);

  const user: ProfileUser | null = isSelf ? (me?.user ?? null) : (publicProfile?.user ?? null);
  const profile = isSelf ? (me?.profile ?? null) : (publicProfile?.profile ?? null);
  const isLoading = isSelf ? meQuery.isLoading : publicQuery.isLoading;
  const isError = isSelf ? meQuery.isError : publicQuery.isError;
  const error = isSelf ? meQuery.error : publicQuery.error;
  const refetch = isSelf ? meQuery.refetch : publicQuery.refetch;

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
    user,
    profile,
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
