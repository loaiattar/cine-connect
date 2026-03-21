import { Request, Response } from "express";
import { success } from "../utils";
import { AuthService } from "../services/auth.service";

export const AuthController = {
    async register(req: Request, res: Response) {
        const { name, email, password } = req.body;
        const result = await AuthService.register(name, email, password);
        return success(res, result, 201);
    },

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        return success(res, result);
    },

    async refresh(req: Request, res: Response) {
        const { refreshToken } = req.body;
        const result = await AuthService.refresh(refreshToken);
        return success(res, result);
    },
};
