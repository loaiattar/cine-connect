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

/** GET /api/users/:userId/profile response (public, no email) */
export interface GetPublicProfileResponse {
  user: { id: number; name: string | null; createdAt: string | null };
  profile: UserProfileRow | null;
}

/** PUT /api/users/me body; all fields optional */
export interface UpdateProfilePayload {
  bio?: string;
  avatarUrl?: string;
  location?: string;
  favoriteGenre?: string;
}

export const userService = {
  getMe: () => apiClient.get<GetMeResponse>("/api/users/me"),
  getPublicProfile: (userId: number) =>
    apiClient.get<GetPublicProfileResponse>(`/api/users/${userId}/profile`),
  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.put<UserProfileRow>("/api/users/me", data),
};
