import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const secret = process.env.JWT_SECRET || "fixed_test_secret_123";
        const decoded = jwt.verify(token, secret) as { userId: number };

        if (!decoded.userId) {
            console.error("Token decoded but userId is missing!");
            return res.status(401).json({ error: "Invalid token payload" });
        }

        (req as any).user = { userId: decoded.userId };
        next();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("JWT Verification Failed:", message);
        return res.status(401).json({ error: `Unauthorized: ${message}` });
    }
};