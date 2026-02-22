import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodObject } from "zod";

export const validate = (schema: ZodObject<any, any>) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError || (error as any)?.name === 'ZodError') {
                const issues = (error as any).issues || (error as any).errors || [];
                return res.status(400).json({
                    status: "error",
                    message: "Validation Failed",
                    errors: issues.map((e: any) => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            return res.status(500).json({ error: "Internal Server Error during validation" });
        }
    };