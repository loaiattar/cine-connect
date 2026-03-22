import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/errorHandler.middleware";

describe("asyncHandler", () => {
  it("forwards rejection to next", async () => {
    const err = new Error("async boom");
    const fn = vi.fn().mockRejectedValue(err);
    const next = vi.fn() as NextFunction;
    const wrapped = asyncHandler(fn);

    wrapped({} as Request, {} as Response, next);

    await vi.waitFor(() => {
      expect(next).toHaveBeenCalledWith(err);
    });
    expect(fn).toHaveBeenCalled();
  });

  it("does not call next when handler resolves", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const next = vi.fn() as NextFunction;
    asyncHandler(fn)({} as Request, {} as Response, next);

    await vi.waitFor(() => {
      expect(fn).toHaveBeenCalled();
    });
    expect(next).not.toHaveBeenCalled();
  });
});
