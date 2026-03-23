import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDisplayApiError, useQueryDisplayError } from "@/hooks/useNormalizedApiError";
import { useCallback } from "react";
import {
  userService,
  type GetMeResponse,
  type GetPublicProfileResponse,
  type PublicProfileStats,
  type UserProfileRow,
  type UpdateProfilePayload,
} from "@/service/user.service";
import { useAuth } from "@/hooks/useAuth";

/** User shape returned by useProfile (me has email, public profile does not). */
export type ProfileUser = (GetMeResponse["user"] | GetPublicProfileResponse["user"]) & {
  email?: string | null;
};

function withDefaultStats(p: GetPublicProfileResponse): GetPublicProfileResponse {
  return {
    ...p,
    stats: p.stats ?? { followersCount: 0, followingCount: 0 },
  };
}

export interface UseProfileReturn {
  user: ProfileUser | null;
  profile: UserProfileRow | null;
  /** From GET /api/v1/users/:userId only (follower/following counts). */
  stats: PublicProfileStats | null;
  /** From GET /api/v1/users/:userId when logged in as another user (optional). */
  isFollowingFromApi: boolean | undefined;
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
 * fetches GET /api/v1/users/me and exposes updateProfile. For another user, fetches
 * GET /api/v1/users/:userId (public profile, no email).
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

  const me = meQuery.data ?? null;
  const publicProfile =
    publicQuery.data != null ? withDefaultStats(publicQuery.data) : null;

  const user: ProfileUser | null = isSelf ? (me?.user ?? null) : (publicProfile?.user ?? null);
  const profile = isSelf ? (me?.profile ?? null) : (publicProfile?.profile ?? null);
  const stats = !isSelf ? (publicProfile?.stats ?? null) : null;
  const isFollowingFromApi = !isSelf ? publicProfile?.isFollowing : undefined;
  const isLoading = isSelf ? meQuery.isLoading : publicQuery.isLoading;
  const isError = isSelf ? meQuery.isError : publicQuery.isError;
  const error = isSelf ? meQuery.error : publicQuery.error;
  const refetch = isSelf ? meQuery.refetch : publicQuery.refetch;

  const updateError = useDisplayApiError(updateMutation.error);
  const displayQueryError = useQueryDisplayError(isError, error);

  return {
    user,
    profile,
    stats,
    isFollowingFromApi,
    isLoading,
    isError,
    error: displayQueryError,
    refetch,
    updateProfile,
    isUpdating: updateMutation.isPending,
    updateError,
    isCurrentUser: isSelf,
  };
}
