import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/errorHandler.middleware";
import { validate } from "../middlewares/validation.middleware";
import { registerSchema, loginSchema, refreshSchema } from "../schemas/auth.schema";

const router: Router = Router();

// POST /api/auth/register
router.post("/register", validate(registerSchema), asyncHandler(AuthController.register));
// POST /api/auth/login
router.post("/login", validate(loginSchema), asyncHandler(AuthController.login));
// POST /api/auth/refresh — cookie `cc_refresh`; rotates tokens; no Bearer required
router.post("/refresh", validate(refreshSchema), asyncHandler(AuthController.refresh));
// POST /api/auth/logout — clears auth cookies
router.post("/logout", asyncHandler(AuthController.logout));

export default router;
