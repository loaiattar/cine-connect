import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  followService,
  type FollowUserRow,
  type FollowListResponse,
} from "@/service/follow.service";
import { useAuth } from "@/hooks/useAuth";

function unwrapFollowList(raw: unknown): FollowListResponse | null {
  if (raw == null) return null;
  if (typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    if (d != null && typeof d === "object" && "users" in d) return d as FollowListResponse;
    return null;
  }
  if (typeof raw === "object" && "users" in raw && Array.isArray((raw as FollowListResponse).users))
    return raw as FollowListResponse;
  return null;
}

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

  const myFollowing = unwrapFollowList(rawMyFollowing);
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
  const followError =
    followMutation.error ?? unfollowMutation.error ?? null;
  const normalizedFollowError =
    followError instanceof Error
      ? followError
      : followError != null && typeof followError === "object" && "message" in followError
        ? new Error(String((followError as { message: string }).message))
        : followError != null
          ? new Error(String(followError))
          : null;

  /** Followers of profileUserId */
  const {
    data: rawFollowers,
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

  const followersData = unwrapFollowList(rawFollowers);
  const followers = followersData?.users ?? [];
  const followersTotal = followersData?.total ?? 0;

  /** Following of profileUserId */
  const {
    data: rawFollowing,
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

  const followingData = unwrapFollowList(rawFollowing);
  const following = followingData?.users ?? [];
  const followingTotal = followingData?.total ?? 0;

  return {
    isFollowing: isSelf ? false : isFollowing,
    follow,
    unfollow,
    isFollowLoading,
    followError: normalizedFollowError,
    followers,
    followersTotal,
    followersLoading: followersLoading,
    followersError:
      followersIsError && followersError
        ? followersError instanceof Error
          ? followersError
          : new Error(String(followersError))
        : null,
    refetchFollowers,
    following,
    followingTotal,
    followingLoading,
    followingError:
      followingIsError && followingError
        ? followingError instanceof Error
          ? followingError
          : new Error(String(followingError))
        : null,
    refetchFollowing,
  };
}
