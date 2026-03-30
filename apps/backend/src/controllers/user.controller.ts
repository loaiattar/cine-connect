import { Request, Response } from "express";
import { badRequest, success } from "../utils";
import { UserService } from "../services/user.service";
import { clearAuthCookies } from "../utils/authCookies";
import fs from "node:fs/promises";
import path from "node:path";
import { avatarUploadDir } from "../paths";

function fileExtensionFromMimeType(mimeType: string): string {
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return ".bin";
}

function avatarPathFromUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null;
  const marker = "/uploads/avatars/";
  const idx = avatarUrl.indexOf(marker);
  if (idx < 0) return null;
  const filename = avatarUrl.slice(idx + marker.length);
  if (!filename || filename.includes("/") || filename.includes("\\")) return null;
  return path.join(avatarUploadDir, filename);
}

export const UserController = {
  async getMe(req: Request, res: Response) {
    const userId = req.user!.userId;
    const result = await UserService.getMe(userId);
    return success(res, result);
  },

  async updateMe(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { bio, avatarUrl, location, favoriteGenre } = req.body;
    const result = await UserService.updateProfile(userId, {
      bio,
      avatarUrl,
      location,
      favoriteGenre,
    });
    return success(res, result);
  },

  async uploadAvatar(req: Request, res: Response) {
    const userId = req.user!.userId;
    if (!req.file) {
      throw badRequest("Avatar file is required");
    }

    const previous = await UserService.getMe(userId);
    await fs.mkdir(avatarUploadDir, { recursive: true });

    const ext = fileExtensionFromMimeType(req.file.mimetype);
    const filename = `u${userId}-${Date.now()}${ext}`;
    const absoluteFilePath = path.join(avatarUploadDir, filename);
    await fs.writeFile(absoluteFilePath, req.file.buffer);

    /** Same-origin path so the SPA (and Vite dev proxy) can load `/uploads/...` without hard-coding API host/port. */
    const avatarUrl = `/uploads/avatars/${filename}`;
    const updated = await UserService.updateProfile(userId, { avatarUrl });

    const oldAvatarPath = avatarPathFromUrl(previous.profile?.avatarUrl);
    if (oldAvatarPath && oldAvatarPath !== absoluteFilePath) {
      await fs.unlink(oldAvatarPath).catch(() => undefined);
    }

    return success(res, updated);
  },

  async deleteMe(req: Request, res: Response) {
    const userId = req.user!.userId;
    const me = await UserService.getMe(userId);
    await UserService.deleteAccount(userId);
    clearAuthCookies(res);

    const avatarPath = avatarPathFromUrl(me.profile?.avatarUrl);
    if (avatarPath) {
      await fs.unlink(avatarPath).catch(() => undefined);
    }

    return success(res, { deleted: true });
  },

  /** GET /api/users/:userId and GET /api/users/:userId/profile (same payload). */
  async getPublicUser(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const viewerUserId = req.user?.userId ?? null;
    const result = await UserService.getPublicUserById(userId, viewerUserId);
    return success(res, result);
  },

  async searchUsers(req: Request, res: Response) {
    const q = String(req.query.q ?? "");
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    const viewerUserId = req.user?.userId ?? null;
    const result = await UserService.searchPublicUsers(q, limit, offset, viewerUserId);
    return success(res, result);
  },
};
