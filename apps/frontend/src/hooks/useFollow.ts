import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useDisplayApiError, useQueryDisplayError } from "@/hooks/useNormalizedApiError";
import { followService, type FollowUserRow } from "@/service/follow.service";
import { useAuth } from "@/hooks/useAuth";

export interface UseFollowOptions {
  /** Fetch followers list for profileUserId (default true) */
  fetchFollowers?: boolean;
  /** Fetch following list for profileUserId (default true) */
  fetchFollowing?: boolean;
  /** Limit for followers/following lists (default 50) */
  listLimit?: number;
}

export interface UseFollowReturn {
  /** Whether the current user follows profileUserId (only when viewing another user) */
  isFollowing: boolean;
  follow: (userId: number) => void;
  unfollow: (userId: number) => void;
  /** Loading for follow/unfollow mutation */
  isFollowLoading: boolean;
  followError: Error | null;
  /** Followers of profileUserId */
  followers: FollowUserRow[];
  followersTotal: number;
  followersLoading: boolean;
  followersError: Error | null;
  refetchFollowers: () => void;
  /** Following list of profileUserId */
  following: FollowUserRow[];
  followingTotal: number;
  followingLoading: boolean;
  followingError: Error | null;
  refetchFollowing: () => void;
}

/**
 * Follow/unfollow and optional followers/following lists for a profile user.
 * When profileUserId is the current user, isFollowing is false (cannot follow self).
 * isFollowing is derived from the current user's "following" list (no dedicated backend check).
 */
export function useFollow(
  profileUserId: number | null | undefined,
  options: UseFollowOptions = {}
): UseFollowReturn {
  const {
    fetchFollowers = true,
    fetchFollowing = true,
    listLimit = 50,
  } = options;

  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const currentUserId = authUser?.userId ?? null;
  const isSelf = profileUserId != null && currentUserId != null && profileUserId === currentUserId;

  /** Current user's following list — used to derive isFollowing when viewing another profile */
  const { data: rawMyFollowing } = useQuery({
    queryKey: ["follow", "following", currentUserId],
    queryFn: () => followService.getFollowing(currentUserId!, { limit: 200 }),
    enabled: currentUserId != null && profileUserId != null && !isSelf,
  });

  const myFollowing = rawMyFollowing;
  const isFollowing = useMemo(
    () =>
      !isSelf &&
      profileUserId != null &&
      (myFollowing?.users ?? []).some((u) => u.id === profileUserId),
    [isSelf, profileUserId, myFollowing]
  );

  const followMutation = useMutation({
    mutationFn: (userId: number) => followService.follow(userId),
    onSuccess: () => {
      if (currentUserId != null) {
        queryClient.invalidateQueries({ queryKey: ["follow", "following", currentUserId] });
      }
      if (profileUserId != null) {
        queryClient.invalidateQueries({ queryKey: ["follow", "followers", profileUserId] });
        queryClient.invalidateQueries({ queryKey: ["follow", "following", profileUserId] });
        queryClient.invalidateQueries({ queryKey: ["user", "profile", profileUserId] });
      }
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: number) => followService.unfollow(userId),
    onSuccess: () => {
      if (currentUserId != null) {
        queryClient.invalidateQueries({ queryKey: ["follow", "following", currentUserId] });
      }
      if (profileUserId != null) {
        queryClient.invalidateQueries({ queryKey: ["follow", "followers", profileUserId] });
        queryClient.invalidateQueries({ queryKey: ["follow", "following", profileUserId] });
        queryClient.invalidateQueries({ queryKey: ["user", "profile", profileUserId] });
      }
    },
  });

  const follow = useCallback(
    (userId: number) => followMutation.mutate(userId),
    [followMutation]
  );
  const unfollow = useCallback(
    (userId: number) => unfollowMutation.mutate(userId),
    [unfollowMutation]
  );

  const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;
  const normalizedFollowError = useDisplayApiError(
    followMutation.error ?? unfollowMutation.error ?? null
  );

  /** Followers of profileUserId */
  const {
    data: followersData,
    isLoading: followersLoading,
    isError: followersIsError,
    error: followersError,
    refetch: refetchFollowers,
  } = useQuery({
    queryKey: ["follow", "followers", profileUserId, listLimit],
    queryFn: () =>
      followService.getFollowers(profileUserId!, { limit: listLimit, offset: 0 }),
    enabled: fetchFollowers && profileUserId != null,
  });
  const followers = followersData?.users ?? [];
  const followersTotal = followersData?.total ?? 0;

  /** Following of profileUserId */
  const {
    data: followingData,
    isLoading: followingLoading,
    isError: followingIsError,
    error: followingError,
    refetch: refetchFollowing,
  } = useQuery({
    queryKey: ["follow", "following", profileUserId, listLimit],
    queryFn: () =>
      followService.getFollowing(profileUserId!, { limit: listLimit, offset: 0 }),
    enabled: fetchFollowing && profileUserId != null,
  });
  const following = followingData?.users ?? [];
  const followingTotal = followingData?.total ?? 0;

  const followersDisplayError = useQueryDisplayError(followersIsError, followersError);
  const followingDisplayError = useQueryDisplayError(followingIsError, followingError);

  return {
    isFollowing: isSelf ? false : isFollowing,
    follow,
    unfollow,
    isFollowLoading,
    followError: normalizedFollowError,
    followers,
    followersTotal,
    followersLoading: followersLoading,
    followersError: followersDisplayError,
    refetchFollowers,
    following,
    followingTotal,
    followingLoading,
    followingError: followingDisplayError,
    refetchFollowing,
  };
}
