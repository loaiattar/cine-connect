import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import { updateProfileSchema } from "../schemas/user.schema";

const router: Router = Router();

router.get("/me", authMiddleware, asyncHandler(UserController.getMe));
router.put("/me", authMiddleware, validate(updateProfileSchema), asyncHandler(UserController.updateMe));

export default router;
