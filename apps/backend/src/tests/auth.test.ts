import { describe, it, expect } from "vitest";
import request, { type Response } from "supertest";
import express from "express";
import rateLimit from "express-rate-limit";
import app from "../app";
import { AuthService } from "../services/auth.service";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "../utils/authCookies";
import { cookieHeaderFromResponse } from "./cookieHelpers";

describe("Auth - Registration (service)", () => {
  it("should throw 409 when registering with an email that already exists", async () => {
    const email = "duplicate@example.com";

    await AuthService.register("First", email, "password123");

    await expect(AuthService.register("Second", email, "password456")).rejects.toMatchObject({
      name: "AppError",
      statusCode: 409,
      message: "Email already registered",
    });
  });
});

function expectAuthCookies(res: Response): void {
  const raw = res.headers["set-cookie"];
  expect(raw).toBeDefined();
  const list = Array.isArray(raw) ? raw : [raw as string];
  const joined = list.join("\n");
  expect(joined).toContain(`${COOKIE_ACCESS}=`);
  expect(joined).toContain(`${COOKIE_REFRESH}=`);
}

describe("Auth REST endpoints", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register, set httpOnly cookies, and return userId + email only (201)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "New User", email: `register-${Date.now()}@example.com`, password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        userId: expect.any(Number),
        email: expect.stringMatching(/@/),
      });
      expect(res.body.data).not.toHaveProperty("token");
      expect(res.body.data).not.toHaveProperty("refreshToken");
      expectAuthCookies(res);
    });

    it("should return 409 when email already exists", async () => {
      const email = `dup-${Date.now()}@example.com`;
      await request(app).post("/api/v1/auth/register").send({ name: "First", email, password: "password123" });

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Second", email, password: "password456" });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Email already registered");
    });

    it("should return 400 for invalid body (missing fields / bad email / short password)", async () => {
      const invalid = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "", email: "not-an-email", password: "short" });

      expect(invalid.status).toBe(400);
      expect(invalid.body.success).toBe(false);
      expect(invalid.body.error).toBe("Validation Failed");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login, set cookies, and return userId + email only (200)", async () => {
      const email = `login-${Date.now()}@example.com`;
      await AuthService.register("Login User", email, "password123");

      const res = await request(app).post("/api/v1/auth/login").send({ email, password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        userId: expect.any(Number),
        email,
      });
      expect(res.body.data).not.toHaveProperty("token");
      expectAuthCookies(res);
    });

    it("should return 401 for wrong password", async () => {
      const email = `wrongpw-${Date.now()}@example.com`;
      await AuthService.register("User", email, "password123");

      const res = await request(app).post("/api/v1/auth/login").send({ email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("should return 401 for unknown email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("should return 400 for invalid body", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({ email: "bad-email", password: "" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Validation Failed");
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("rotates tokens via cc_refresh cookie; old refresh cannot be reused (200 then 401)", async () => {
      const email = `refresh-${Date.now()}@example.com`;
      const reg = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Refresh User", email, password: "password123" });
      expect(reg.status).toBe(201);
      const cookiesAfterRegister = cookieHeaderFromResponse(reg);

      const res = await request(app).post("/api/v1/auth/refresh").set("Cookie", cookiesAfterRegister).send({});
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({ userId: expect.any(Number), email });
      expect(res.body.data).not.toHaveProperty("token");
      expectAuthCookies(res);

      const second = await request(app).post("/api/v1/auth/refresh").set("Cookie", cookiesAfterRegister).send({});
      expect(second.status).toBe(401);
      expect(second.body.success).toBe(false);
    });

    it("returns 401 when refresh cookie is missing", async () => {
      const res = await request(app).post("/api/v1/auth/refresh").send({});
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 for invalid refresh token in cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `${COOKIE_REFRESH}=definitely-not-valid`)
        .send({});
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("clears auth cookies when session cookies are present", async () => {
      const reg = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Logout User", email: `logout-${Date.now()}@example.com`, password: "password123" });
      expect(reg.status).toBe(201);
      const c = cookieHeaderFromResponse(reg);

      const out = await request(app).post("/api/v1/auth/logout").set("Cookie", c).send({});
      expect(out.status).toBe(200);
      expect(out.body.success).toBe(true);

      const cleared = out.headers["set-cookie"];
      expect(cleared).toBeDefined();
      const list = Array.isArray(cleared) ? cleared : [cleared as string];
      const text = list.join(" ").toLowerCase();
      expect(text).toContain("cc_access");
      expect(text.includes("max-age=0") || text.includes("jan 1970")).toBe(true);
    });
  });

  it("access cookie from register works with authMiddleware on protected route", async () => {
    const email = `protected-${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "Protected User", email, password: "password123" });
    expect(registerRes.status).toBe(201);
    const { userId } = registerRes.body.data;
    const cookie = cookieHeaderFromResponse(registerRes);

    const res = await request(app).get(`/api/v1/movies/favorites/${userId}`).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("Auth rate limiting", () => {
  it("returns 429 after exceeding limit (strict limiter)", async () => {
    const strictLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      message: { success: false, error: "Too many attempts. Please try again later." },
      standardHeaders: true,
      legacyHeaders: false,
    });
    const limitedApp = express();
    limitedApp.use(express.json());
    limitedApp.use("/api/v1/auth", strictLimiter, (req, res) => res.status(200).json({ ok: true }));

    const r1 = await request(limitedApp).post("/api/v1/auth/login").send({ email: "a@b.com", password: "x" });
    const r2 = await request(limitedApp).post("/api/v1/auth/login").send({ email: "a@b.com", password: "x" });
    const r3 = await request(limitedApp).post("/api/v1/auth/login").send({ email: "a@b.com", password: "x" });

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(429);
    expect(r3.body.success).toBe(false);
    expect(r3.body.error).toBe("Too many attempts. Please try again later.");
  });
});
