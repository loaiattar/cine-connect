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

/** GET /api/v1/users/me response */
export interface GetMeResponse {
  user: UserMeRow;
  profile: UserProfileRow | null;
}

/** GET /api/v1/users/:userId (and legacy /profile) — public, no email */
export interface PublicProfileStats {
  followersCount: number;
  followingCount: number;
}

export interface GetPublicProfileResponse {
  user: { id: number; name: string | null; createdAt: string | null };
  profile: UserProfileRow | null;
  /** Present on current GET /api/v1/users/:userId; older clients may omit. */
  stats?: PublicProfileStats;
  /** When the caller is logged in and viewing another user. */
  isFollowing?: boolean;
}

/** PUT /api/v1/users/me body; all fields optional */
export interface UpdateProfilePayload {
  bio?: string;
  avatarUrl?: string;
  location?: string;
  favoriteGenre?: string;
}

/** GET /api/v1/users/search — public fields only (no email). */
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
  getMe: () => apiClient.get<GetMeResponse>("/api/v1/users/me"),
  getPublicProfile: (userId: number) =>
    apiClient.get<GetPublicProfileResponse>(`/api/v1/users/${userId}`),
  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.put<UserProfileRow>("/api/v1/users/me", data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post<UserProfileRow>("/api/v1/users/me/avatar", formData);
  },
  deleteMyAccount: () => apiClient.delete<{ deleted: true }>("/api/v1/users/me"),

  searchUsers: (q: string, options?: UserSearchOptions) => {
    const params = new URLSearchParams();
    params.set("q", q);
    if (options?.limit != null) params.set("limit", String(options.limit));
    if (options?.offset != null) params.set("offset", String(options.offset));
    return apiClient.get<UserSearchResponse>(`/api/v1/users/search?${params.toString()}`);
  },
};
