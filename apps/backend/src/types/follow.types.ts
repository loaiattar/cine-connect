/**
 * Public user row for GET /users/:userId/followers and /following.
 * Intentionally excludes email (public / any authenticated viewer).
 */
export type PublicFollowListUser = {
  id: number;
  name: string | null;
  createdAt: Date | null;
  followedAt: Date;
  avatarUrl: string | null;
};
