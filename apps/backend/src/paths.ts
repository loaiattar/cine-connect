import fs from "node:fs";
import path from "node:path";

/**
 * Backend package root (`apps/backend`), derived from this file location — not `process.cwd()`.
 * Ensures uploads and `express.static` agree on disk when the server is started from the monorepo root, from `apps/backend`, or via Docker.
 */
export const backendPackageRoot = path.resolve(__dirname, "..");

export const uploadsPublicRoot = path.join(backendPackageRoot, "uploads");

export const avatarUploadDir = path.join(uploadsPublicRoot, "avatars");

/** When the process was started from the monorepo root, older code wrote under `cwd/uploads`. */
export const legacyUploadsRootFromCwd = path.resolve(process.cwd(), "uploads");

const legacyAvatarDir = path.join(legacyUploadsRootFromCwd, "avatars");

/**
 * `<repo>/uploads/avatars` — same as `cwd/uploads` when cwd is the repo root, but when cwd is
 * `apps/backend`, `legacyUploadsRootFromCwd` equals the canonical `uploads` dir and we skip the
 * cwd-based legacy branch; files that only exist under the repo root would otherwise never be found.
 */
export const monorepoRootUploadsAvatarsDir = path.resolve(backendPackageRoot, "..", "..", "uploads", "avatars");

function isPathInsideDir(candidate: string, dir: string): boolean {
  const root = path.resolve(dir);
  const file = path.resolve(candidate);
  if (process.platform === "win32") {
    const r = root.toLowerCase();
    const f = file.toLowerCase();
    return f === r || f.startsWith(`${r}\\`) || f.startsWith(`${r}/`);
  }
  const rel = path.relative(root, file);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/**
 * Resolves an on-disk path for a single avatar filename, checking canonical `apps/backend/uploads/avatars`
 * then legacy `cwd/uploads/avatars`. Returns `null` if the file does not exist or the name is unsafe.
 */
export function resolveExistingAvatarFilePath(filename: string): string | null {
  if (!filename || filename.includes("\0")) return null;
  let base: string;
  try {
    base = path.basename(decodeURIComponent(filename));
  } catch {
    return null;
  }
  if (!base || base === "." || base === "..") return null;

  const primary = path.join(avatarUploadDir, base);
  if (!isPathInsideDir(primary, avatarUploadDir)) return null;
  if (fs.existsSync(primary)) return path.resolve(primary);

  const monorepo = path.join(monorepoRootUploadsAvatarsDir, base);
  if (isPathInsideDir(monorepo, monorepoRootUploadsAvatarsDir) && fs.existsSync(monorepo)) {
    return path.resolve(monorepo);
  }

  if (path.normalize(legacyUploadsRootFromCwd) === path.normalize(uploadsPublicRoot)) {
    return null;
  }
  const legacy = path.join(legacyAvatarDir, base);
  if (!isPathInsideDir(legacy, legacyAvatarDir)) return null;
  if (fs.existsSync(legacy)) return path.resolve(legacy);

  return null;
}
