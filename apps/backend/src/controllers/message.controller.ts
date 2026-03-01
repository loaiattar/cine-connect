import { Request, Response } from "express";
import { MessageService } from "../services/message.service";
import { success } from "../utils";

export const MessageController = {
  async getByRoom(req: Request, res: Response) {
    const room = (req.query.room as string).trim();
    const limit = req.query.limit != null ? Number(req.query.limit) : 50;
    const offset = req.query.offset != null ? Number(req.query.offset) : 0;
    const result = await MessageService.getByRoom(room, limit, offset);
    return success(res, result);
  },
};
