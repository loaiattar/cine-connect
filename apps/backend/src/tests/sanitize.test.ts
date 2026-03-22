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

  it("returns empty string for empty input after trim", () => {
    expect(sanitizeUserText("   ")).toBe("");
    expect(sanitizeUserText("")).toBe("");
  });

  it("returns empty for non-string input", () => {
    expect(sanitizeUserText(null as unknown as string)).toBe("");
    expect(sanitizeUserText(undefined as unknown as string)).toBe("");
    expect(sanitizeUserText(42 as unknown as string)).toBe("");
  });

  it("normalizes newlines in plain text", () => {
    const out = sanitizeUserText("line1\nline2");
    expect(out).toContain("line1");
    expect(out).toContain("line2");
  });
});
