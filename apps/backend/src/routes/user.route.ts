import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { FollowController } from "../controllers/follow.controller";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import { updateProfileSchema, getPublicProfileSchema, searchUsersSchema } from "../schemas/user.schema";
import { getFollowersSchema, getFollowingSchema } from "../schemas/follow.schema";
import { uploadAvatar } from "../middlewares/upload.middleware";

const router: Router = Router();

router.get("/me", authMiddleware, asyncHandler(UserController.getMe));
router.put("/me", authMiddleware, validate(updateProfileSchema), asyncHandler(UserController.updateMe));
router.post("/me/avatar", authMiddleware, uploadAvatar, asyncHandler(UserController.uploadAvatar));
router.delete("/me", authMiddleware, asyncHandler(UserController.deleteMe));
router.get("/search", validate(searchUsersSchema), asyncHandler(UserController.searchUsers));
router.get(
  "/:userId/profile",
  optionalAuthMiddleware,
  validate(getPublicProfileSchema),
  asyncHandler(UserController.getPublicUser)
);
router.get("/:userId/followers", validate(getFollowersSchema), asyncHandler(FollowController.getFollowers));
router.get("/:userId/following", validate(getFollowingSchema), asyncHandler(FollowController.getFollowing));
router.get(
  "/:userId",
  optionalAuthMiddleware,
  validate(getPublicProfileSchema),
  asyncHandler(UserController.getPublicUser)
);

export default router;
