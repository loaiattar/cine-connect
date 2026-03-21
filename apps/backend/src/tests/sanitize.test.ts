import { describe, it, expect } from "vitest";
import { sanitizeUserText } from "../utils/sanitize";

describe("sanitizeUserText", () => {
  it("removes script tags and keeps text", () => {
    expect(sanitizeUserText('Hello<script>alert(1)</script>')).toBe("Hello");
  });

  it("trims whitespace", () => {
    expect(sanitizeUserText("  x  ")).toBe("x");
  });

  it("returns empty for markup-only input", () => {
    expect(sanitizeUserText("<img src=x onerror=alert(1)>")).toBe("");
  });

  it("preserves plain text and apostrophes", () => {
    expect(sanitizeUserText("C'est un bon film!")).toBe("C'est un bon film!");
  });
});
