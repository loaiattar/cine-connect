import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config";
import type { RequestUser } from "../types/auth.types";
import { getAccessTokenFromRequest } from "../utils/authCookies";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = getAccessTokenFromRequest(req);

    if (!token) {
        return res.status(401).json({ success: false, error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };

        if (!decoded.userId) {
            console.error("Token decoded but userId is missing!");
            return res.status(401).json({ error: "Invalid token payload" });
        }

        req.user = { userId: decoded.userId } satisfies RequestUser;
        next();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("JWT Verification Failed:", message);
        return res.status(401).json({ success: false, error: `Unauthorized: ${message}` });
    }
};

/** Same as authMiddleware but does not return 401: if no/invalid token, continues without req.user. */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = getAccessTokenFromRequest(req);
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };
        if (decoded.userId) {
            req.user = { userId: decoded.userId } satisfies RequestUser;
        }
    } catch {
        // ignore invalid token
    }
    next();
};