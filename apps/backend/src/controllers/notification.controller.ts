import { Request, Response } from "express";
import { success } from "../utils";
import { NotificationService } from "../services/notification.service";
import { notFound } from "../utils";

export const NotificationController = {
    async list(req: Request, res: Response) {
        const userId = req.user!.userId;
        const limit = Number(req.query.limit) || 50;
        const offset = Number(req.query.offset) || 0;
        const unreadOnly = req.query.unreadOnly === "true" || req.query.unreadOnly === "1";
        const result = await NotificationService.list(userId, limit, offset, unreadOnly);
        return success(res, result);
    },

    async markAsRead(req: Request, res: Response) {
        const userId = req.user!.userId;
        const notificationId = Number(req.params.id);
        const result = await NotificationService.markAsRead(userId, notificationId);
        if (!result) throw notFound("Notification not found");
        return success(res, result);
    },

    async markAllAsRead(req: Request, res: Response) {
        const userId = req.user!.userId;
        const result = await NotificationService.markAllAsRead(userId);
        return success(res, result);
    },
};
