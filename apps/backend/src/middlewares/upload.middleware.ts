import multer from "multer";
import type { RequestHandler } from "express";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

function isImageMimeType(mimeType: string): boolean {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType);
}

export const uploadAvatar: RequestHandler = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!isImageMimeType(file.mimetype)) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("avatar");

