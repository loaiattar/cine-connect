import type { Response } from "supertest";

/** Build a `Cookie` request header from `Set-Cookie` response headers (name=value pairs only). */
export function cookieHeaderFromResponse(res: Response): string {
  const raw = res.headers["set-cookie"];
  if (!raw) return "";
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((c) => c.split(";")[0]).join("; ");
}
