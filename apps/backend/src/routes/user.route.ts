import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { FollowController } from "../controllers/follow.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import { updateProfileSchema } from "../schemas/user.schema";
import { getFollowersSchema, getFollowingSchema } from "../schemas/follow.schema";

const router: Router = Router();

router.get("/me", authMiddleware, asyncHandler(UserController.getMe));
router.put("/me", authMiddleware, validate(updateProfileSchema), asyncHandler(UserController.updateMe));
router.get("/:userId/followers", validate(getFollowersSchema), asyncHandler(FollowController.getFollowers));
router.get("/:userId/following", validate(getFollowingSchema), asyncHandler(FollowController.getFollowing));

export default router;
