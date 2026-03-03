import { Router } from "express";
import { FollowController } from "../controllers/follow.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import { followBodySchema, userIdParamSchema } from "../schemas/follow.schema";

const router: Router = Router();

router.post("/", authMiddleware, validate(followBodySchema), asyncHandler(FollowController.follow));
router.delete("/:userId", authMiddleware, validate(userIdParamSchema), asyncHandler(FollowController.unfollow));

export default router;
