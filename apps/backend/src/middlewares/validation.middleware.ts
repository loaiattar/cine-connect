import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodObject } from "zod";
import { failure } from "../utils/apiResponse";

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
                return failure(res, "Validation Failed", 400, {
                    errors: issues.map((e: any) => ({
                        path: e.path.join("."),
                        message: e.message,
                    })),
                });
            }
            return failure(res, "Internal Server Error during validation", 500);
        }
    };