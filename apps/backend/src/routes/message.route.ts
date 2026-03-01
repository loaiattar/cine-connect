import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import { getMessagesSchema } from "../schemas/message.schema";

const router: Router = Router();

/** GET /api/messages?room=...&limit=50&offset=0 — paginated message history for a room. Requires auth. */
router.get(
  "/",
  authMiddleware,
  validate(getMessagesSchema),
  asyncHandler(MessageController.getByRoom)
);

export default router;
