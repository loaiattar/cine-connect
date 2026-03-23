import { Request, Response } from "express";
import { success } from "../utils";
import { FollowService } from "../services/follow.service";

export const FollowController = {
  async follow(req: Request, res: Response) {
    const followerId = req.user!.userId;
    const { followingId } = req.body;
    const result = await FollowService.follow(followerId, followingId);
    return success(res, result, 201);
  },

  async unfollow(req: Request, res: Response) {
    const followerId = req.user!.userId;
    const userId = Number(req.params.userId);
    const result = await FollowService.unfollow(followerId, userId);
    return success(res, result ?? { unfollowed: true });
  },

  async getFollowers(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const result = await FollowService.getFollowers(userId, limit, offset);
    return success(res, result);
  },

  async getFollowing(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const result = await FollowService.getFollowing(userId, limit, offset);
    return success(res, result);
  },
};
