import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";
import { forgotPasswordRateLimiter } from "../middlewares/rateLimit.middleware";

const router: Router = Router();

// POST /api/auth/register
router.post("/register", validate(registerSchema), asyncHandler(AuthController.register));
// POST /api/auth/login
router.post("/login", validate(loginSchema), asyncHandler(AuthController.login));
// POST /api/auth/refresh — cookie `cc_refresh`; rotates tokens; no Bearer required
router.post("/refresh", validate(refreshSchema), asyncHandler(AuthController.refresh));
// POST /api/auth/logout — clears auth cookies
router.post("/logout", asyncHandler(AuthController.logout));
// POST /api/auth/forgot-password — always generic response
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(AuthController.forgotPassword)
);
// POST /api/auth/reset-password — set new password using one-time token
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(AuthController.resetPassword));

export default router;
