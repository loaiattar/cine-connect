import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import { success, failure, error } from "../utils/apiResponse";

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe("apiResponse", () => {
  let res: ReturnType<typeof createMockRes>;

  beforeEach(() => {
    res = createMockRes();
  });

  describe("success", () => {
    it("returns 200 with envelope by default", () => {
      const payload = { id: 1, name: "x" };
      const out = success(res, payload);
      expect(out).toBe(res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: payload });
    });

    it("accepts custom status for 201", () => {
      success(res, { ok: true }, 201);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { ok: true } });
    });
  });

  describe("failure", () => {
    it("returns status and error message", () => {
      failure(res, "Not allowed", 403);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: "Not allowed" });
    });

    it("omits errors when empty array", () => {
      failure(res, "Validation Failed", 400, { errors: [] });
      expect(res.json).toHaveBeenCalledWith({ success: false, error: "Validation Failed" });
    });

    it("includes errors when non-empty", () => {
      const issues = [{ path: "body.email", message: "Invalid" }];
      failure(res, "Validation Failed", 400, { errors: issues });
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Validation Failed",
        errors: issues,
      });
    });
  });

  describe("error (deprecated)", () => {
    it("delegates to failure with default 500", () => {
      error(res, "Oops");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: "Oops" });
    });
  });
});
