import { apiClient } from "@/lib/api-client";

export interface UserProfileRow {
  id: number;
  userId: number;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  favoriteGenre: string | null;
}

export interface UserMeRow {
  id: number;
  name: string;
  email: string;
  createdAt: string | null;
}

/** GET /api/users/me response */
export interface GetMeResponse {
  user: UserMeRow;
  profile: UserProfileRow | null;
}

/** GET /api/users/:userId (and legacy /profile) — public, no email */
export interface PublicProfileStats {
  followersCount: number;
  followingCount: number;
}

export interface GetPublicProfileResponse {
  user: { id: number; name: string | null; createdAt: string | null };
  profile: UserProfileRow | null;
  stats: PublicProfileStats;
  /** When the caller is logged in and viewing another user. */
  isFollowing?: boolean;
}

/** PUT /api/users/me body; all fields optional */
export interface UpdateProfilePayload {
  bio?: string;
  avatarUrl?: string;
  location?: string;
  favoriteGenre?: string;
}

/** GET /api/users/search — public fields only (no email). */
export interface UserSearchRow {
  id: number;
  name: string | null;
  avatarUrl: string | null;
}

export interface UserSearchResponse {
  users: UserSearchRow[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserSearchOptions {
  limit?: number;
  offset?: number;
}

export const userService = {
  getMe: () => apiClient.get<GetMeResponse>("/api/users/me"),
  getPublicProfile: (userId: number) =>
    apiClient.get<GetPublicProfileResponse>(`/api/users/${userId}`),
  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.put<UserProfileRow>("/api/users/me", data),

  searchUsers: (q: string, options?: UserSearchOptions) => {
    const params = new URLSearchParams();
    params.set("q", q);
    if (options?.limit != null) params.set("limit", String(options.limit));
    if (options?.offset != null) params.set("offset", String(options.offset));
    return apiClient.get<UserSearchResponse>(`/api/users/search?${params.toString()}`);
  },
};
