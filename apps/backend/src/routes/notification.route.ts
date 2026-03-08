import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import { getNotificationsSchema, notificationIdParamSchema } from "../schemas/notification.schema";

const router: Router = Router();

router.get("/", authMiddleware, validate(getNotificationsSchema), asyncHandler(NotificationController.list));
router.patch("/read", authMiddleware, asyncHandler(NotificationController.markAllAsRead));
router.patch("/:id/read", authMiddleware, validate(notificationIdParamSchema), asyncHandler(NotificationController.markAsRead));

export default router;
