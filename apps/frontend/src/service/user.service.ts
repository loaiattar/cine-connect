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

/** PUT /api/users/me body; all fields optional */
export interface UpdateProfilePayload {
  bio?: string;
  avatarUrl?: string;
  location?: string;
  favoriteGenre?: string;
}

export const userService = {
  getMe: () => apiClient.get<GetMeResponse>("/api/users/me"),
  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.put<UserProfileRow>("/api/users/me", data),
};
