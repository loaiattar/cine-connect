import { describe, it, expect } from "vitest";
import {
  AppError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  badGateway,
} from "../utils/AppError";

describe("AppError", () => {
  it("sets name, message, and default status 500", () => {
    const e = new AppError("Server broke");
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(AppError);
    expect(e.name).toBe("AppError");
    expect(e.message).toBe("Server broke");
    expect(e.statusCode).toBe(500);
  });

  it("accepts custom statusCode", () => {
    const e = new AppError("Gone", 410);
    expect(e.statusCode).toBe(410);
  });
});

describe("AppError factories", () => {
  it("badRequest -> 400", () => {
    const e = badRequest("Bad");
    expect(e.statusCode).toBe(400);
    expect(e.message).toBe("Bad");
  });

  it("unauthorized defaults message", () => {
    expect(unauthorized().statusCode).toBe(401);
    expect(unauthorized().message).toBe("Unauthorized");
    expect(unauthorized("Nope").message).toBe("Nope");
  });

  it("forbidden defaults message", () => {
    expect(forbidden().statusCode).toBe(403);
  });

  it("notFound defaults message", () => {
    expect(notFound().statusCode).toBe(404);
    expect(notFound("Missing").message).toBe("Missing");
  });

  it("conflict defaults message", () => {
    expect(conflict().statusCode).toBe(409);
  });

  it("badGateway defaults message", () => {
    expect(badGateway().statusCode).toBe(502);
  });
});
