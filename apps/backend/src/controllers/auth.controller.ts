import { Request, Response } from "express";
import { success, unauthorized } from "../utils";
import { AuthService } from "../services/auth.service";
import {
    attachAuthCookies,
    clearAuthCookies,
    getRefreshTokenFromRequest,
} from "../utils/authCookies";

function sessionPayload(userId: number, email: string) {
    return { userId, email };
}

export const AuthController = {
    async register(req: Request, res: Response) {
        const { name, email, password } = req.body;
        const result = await AuthService.register(name, email, password);
        attachAuthCookies(res, result.token, result.refreshToken);
        return success(res, sessionPayload(result.userId, result.email), 201);
    },

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        attachAuthCookies(res, result.token, result.refreshToken);
        return success(res, sessionPayload(result.userId, result.email));
    },

    async refresh(req: Request, res: Response) {
        const refreshPlain = getRefreshTokenFromRequest(req);
        if (!refreshPlain) {
            throw unauthorized("Refresh token missing");
        }
        const result = await AuthService.refresh(refreshPlain);
        attachAuthCookies(res, result.token, result.refreshToken);
        return success(res, sessionPayload(result.userId, result.email));
    },

    async logout(_req: Request, res: Response) {
        clearAuthCookies(res);
        return success(res, { loggedOut: true });
    },

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;
        await AuthService.requestPasswordReset(email);
        return success(res, {
            message: "If an account exists for this email, a reset link has been sent.",
        });
    },

    async resetPassword(req: Request, res: Response) {
        const { token, newPassword } = req.body;
        await AuthService.resetPassword(token, newPassword);
        clearAuthCookies(res);
        return success(res, { reset: true });
    },
};
