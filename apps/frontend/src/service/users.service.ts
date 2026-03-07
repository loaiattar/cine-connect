import { apiClient } from "../lib/api-client";

export type FollowUser = {
  id: number;
  name: string | null;
  email: string;
};

type FollowListResponse = {
  users: FollowUser[];
  total: number;
};

export const usersService = {
  async getFollowers(userId: number): Promise<FollowUser[]> {
    const res = await apiClient.get<FollowListResponse>(`/api/users/${userId}/followers`);
    return res.data?.users ?? [];
  },

  async getFollowing(userId: number): Promise<FollowUser[]> {
    const res = await apiClient.get<FollowListResponse>(`/api/users/${userId}/following`);
    return res.data?.users ?? [];
  },
};
