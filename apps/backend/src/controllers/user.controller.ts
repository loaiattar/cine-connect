import { Request, Response } from "express";
import { success } from "../utils";
import { UserService } from "../services/user.service";

export const UserController = {
  async getMe(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const result = await UserService.getMe(userId);
    return success(res, result);
  },

  async updateMe(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const { bio, avatarUrl, location, favoriteGenre } = req.body;
    const result = await UserService.updateProfile(userId, {
      bio,
      avatarUrl,
      location,
      favoriteGenre,
    });
    return success(res, result);
  },

  /** GET /api/users/:userId and GET /api/users/:userId/profile (same payload). */
  async getPublicUser(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const viewerUserId = req.user?.userId ?? null;
    const result = await UserService.getPublicUserById(userId, viewerUserId);
    return success(res, result);
  },

  async searchUsers(req: Request, res: Response) {
    const q = String(req.query.q ?? "");
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    const result = await UserService.searchPublicUsers(q, limit, offset);
    return success(res, result);
  },
};
