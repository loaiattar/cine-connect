import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

/**
 * HTTP integration tests that do not require database writes.
 */
describe("HTTP edge cases (no DB mutations)", () => {
  it("returns 404 JSON for unknown /api/v1 route", async () => {
    const res = await request(app).get("/api/v1/this-route-does-not-exist-xyz");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Route not found");
  });

  it("returns 400 for malformed JSON on POST", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send("{invalid json");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Invalid JSON");
  });

  it("returns 401 for GET /api/v1/messages without auth", async () => {
    const res = await request(app).get("/api/v1/messages").query({ room: "global" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for POST /api/v1/follows without auth", async () => {
    const res = await request(app).post("/api/v1/follows").send({ followingId: 1 });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for GET /api/v1/notifications without auth", async () => {
    const res = await request(app).get("/api/v1/notifications");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for GET /api/v1/users/me without auth", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });

  it("serves OpenAPI spec at /openapi.json", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBeDefined();
    expect(res.body.paths).toBeDefined();
  });
});
