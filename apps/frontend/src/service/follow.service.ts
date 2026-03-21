import { apiClient } from "@/lib/api-client";

/** Single user in a followers/following list (from backend). */
export interface FollowUserRow {
  id: number;
  name: string;
  email: string;
  createdAt: string | null;
  followedAt: string | null;
  avatarUrl?: string | null;
}

/** GET /api/users/:userId/followers or /following response */
export interface FollowListResponse {
  users: FollowUserRow[];
  total: number;
  limit: number;
  offset: number;
}

/** POST /api/follows response (inserted row) */
export interface FollowRow {
  followerId: number;
  followingId: number;
}

/** DELETE /api/follows/:userId response */
export interface UnfollowResponse {
  unfollowed?: boolean;
}

export interface GetFollowListOptions {
  limit?: number;
  offset?: number;
}

export const followService = {
  /** POST /api/follows — follow a user (body: { followingId }). */
  follow: (followingId: number) =>
    apiClient.post<FollowRow>("/api/follows", { followingId }),

  /** DELETE /api/follows/:userId — unfollow a user. */
  unfollow: (userId: number) =>
    apiClient.delete<UnfollowResponse>(`/api/follows/${userId}`),

  /** GET /api/users/:userId/followers */
  getFollowers: (userId: number, options?: GetFollowListOptions) => {
    const params = new URLSearchParams();
    if (options?.limit != null) params.set("limit", String(options.limit));
    if (options?.offset != null) params.set("offset", String(options.offset));
    const q = params.toString();
    return apiClient.get<FollowListResponse>(
      `/api/users/${userId}/followers${q ? `?${q}` : ""}`
    );
  },

  /** GET /api/users/:userId/following */
  getFollowing: (userId: number, options?: GetFollowListOptions) => {
    const params = new URLSearchParams();
    if (options?.limit != null) params.set("limit", String(options.limit));
    if (options?.offset != null) params.set("offset", String(options.offset));
    const q = params.toString();
    return apiClient.get<FollowListResponse>(
      `/api/users/${userId}/following${q ? `?${q}` : ""}`
    );
  },
};
