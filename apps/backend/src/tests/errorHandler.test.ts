import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../middlewares/errorHandler.middleware";
import { AppError } from "../utils";

function createMockRes(): {
  headersSent: boolean;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
} {
  return {
    headersSent: false,
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe("errorHandler", () => {
  const req = {} as Request;
  let res: ReturnType<typeof createMockRes>;
  const next = vi.fn() as NextFunction;

  beforeEach(() => {
    res = createMockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns AppError status and message as JSON", () => {
    errorHandler(new AppError("Not here", 404), req, res as unknown as Response, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Not here" });
  });

  it("does not send when headers already sent", () => {
    res.headersSent = true;
    errorHandler(new AppError("Late", 500), req, res as unknown as Response, next);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 500 for unknown errors", () => {
    errorHandler(new Error("surprise"), req, res as unknown as Response, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Internal Server Error" });
  });

  it("returns 400 for body-parser JSON syntax errors", () => {
    const parseErr = Object.assign(new SyntaxError("bad json"), {
      type: "entity.parse.failed",
      status: 400,
    });
    errorHandler(parseErr, req, res as unknown as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Invalid JSON" });
  });
});
