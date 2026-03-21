import DOMPurify from "isomorphic-dompurify";

const NO_HTML = {
  ALLOWED_TAGS: [] as string[],
  ALLOWED_ATTR: [] as string[],
  KEEP_CONTENT: true,
};

/**
 * Strips HTML/markup from user input for safe storage and display (XSS mitigation).
 * Use for comments, chat, profile text fields, display names, etc.
 */
export function sanitizeUserText(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  return DOMPurify.sanitize(input.trim(), NO_HTML);
}
