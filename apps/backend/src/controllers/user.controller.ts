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
};
