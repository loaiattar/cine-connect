import { apiClient } from "@/lib/api-client";

/** Single user in a followers/following list (from backend; public, no email). */
export interface FollowUserRow {
  id: number;
  name: string | null;
  createdAt: string | null;
  followedAt: string | null;
  avatarUrl?: string | null;
}

/** GET /api/v1/users/:userId/followers or /following response */
export interface FollowListResponse {
  users: FollowUserRow[];
  total: number;
  limit: number;
  offset: number;
}

/** POST /api/v1/follows response (inserted row) */
export interface FollowRow {
  followerId: number;
  followingId: number;
}

/** DELETE /api/v1/follows/:userId response */
export interface UnfollowResponse {
  unfollowed?: boolean;
}

export interface GetFollowListOptions {
  limit?: number;
  offset?: number;
}

export const followService = {
  /** POST /api/v1/follows — follow a user (body: { followingId }). */
  follow: (followingId: number) =>
    apiClient.post<FollowRow>("/api/v1/follows", { followingId }),

  /** DELETE /api/v1/follows/:userId — unfollow a user. */
  unfollow: (userId: number) =>
    apiClient.delete<UnfollowResponse>(`/api/v1/follows/${userId}`),

  /** GET /api/v1/users/:userId/followers */
  getFollowers: (userId: number, options?: GetFollowListOptions) => {
    const params = new URLSearchParams();
    if (options?.limit != null) params.set("limit", String(options.limit));
    if (options?.offset != null) params.set("offset", String(options.offset));
    const q = params.toString();
    return apiClient.get<FollowListResponse>(
      `/api/v1/users/${userId}/followers${q ? `?${q}` : ""}`
    );
  },

  /** GET /api/v1/users/:userId/following */
  getFollowing: (userId: number, options?: GetFollowListOptions) => {
    const params = new URLSearchParams();
    if (options?.limit != null) params.set("limit", String(options.limit));
    if (options?.offset != null) params.set("offset", String(options.offset));
    const q = params.toString();
    return apiClient.get<FollowListResponse>(
      `/api/v1/users/${userId}/following${q ? `?${q}` : ""}`
    );
  },
};
