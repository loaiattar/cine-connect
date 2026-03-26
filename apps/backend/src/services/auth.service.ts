import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getJwtSecret } from "../config";
import { db } from "../db";
import { users, profiles, refreshTokens, passwordResetTokens } from "../db/schema";
import { badRequest, conflict, unauthorized, sanitizeUserText } from "../utils";
import { EmailService } from "./email.service";

/** Access JWT lifetime in seconds (default 15 minutes). Override with JWT_ACCESS_EXPIRES_SECONDS. */
function getAccessTokenExpiresSeconds(): number {
  const raw = process.env.JWT_ACCESS_EXPIRES_SECONDS?.trim();
  if (raw && /^\d+$/.test(raw)) {
    return parseInt(raw, 10);
  }
  return 15 * 60;
}

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function hashRefreshToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

async function persistRefreshToken(userId: number): Promise<string> {
  const plain = randomBytes(32).toString("base64url");
  const tokenHash = hashRefreshToken(plain);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    expiresAt,
  });
  return plain;
}

function signAccessToken(userId: number, email: string): string {
  const options: SignOptions = { expiresIn: getAccessTokenExpiresSeconds() };
  // Unique per issuance so tokens differ even within the same second (register → refresh in CI).
  const jti = randomBytes(16).toString("hex");
  return jwt.sign({ userId, email, jti }, getJwtSecret(), options);
}

async function buildAuthPayload(userId: number, email: string) {
  const token = signAccessToken(userId, email);
  const refreshToken = await persistRefreshToken(userId);
  return { token, refreshToken, userId, email };
}

export const AuthService = {
  async register(name: string, email: string, password: string) {
    const safeName = sanitizeUserText(name);
    if (!safeName) {
      throw badRequest("Name is required");
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      throw conflict("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name: safeName,
      email,
      password: hashedPassword,
    }).returning();

    if (!newUser) throw new Error("Failed to create user");

    await db.insert(profiles).values({
      userId: newUser.id,
    });

    return buildAuthPayload(newUser.id, newUser.email);
  },

  async login(email: string, password: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw unauthorized("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw unauthorized("Invalid credentials");
    }

    return buildAuthPayload(user.id, user.email);
  },

  /**
   * Validates refresh token, revokes it (rotation), issues new access + refresh.
   */
  async refresh(refreshTokenPlain: string) {
    const tokenHash = hashRefreshToken(refreshTokenPlain);
    const now = new Date();

    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(eq(refreshTokens.tokenHash, tokenHash), gt(refreshTokens.expiresAt, now))
      )
      .limit(1);

    if (!row) {
      throw unauthorized("Invalid or expired refresh token");
    }

    await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));

    const user = await db.query.users.findFirst({
      where: eq(users.id, row.userId),
    });

    if (!user) {
      throw unauthorized("Invalid or expired refresh token");
    }

    return buildAuthPayload(user.id, user.email);
  },

  async requestPasswordReset(email: string): Promise<void> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true, email: true },
    });

    // Always resolve successfully to avoid account enumeration.
    if (!user) return;

    const tokenPlain = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(tokenPlain).digest("hex");
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const frontendBase = process.env.FRONTEND_APP_URL?.trim()
      || process.env.FRONTEND_ORIGIN?.trim()
      || "http://localhost:8080";
    const resetUrl = `${frontendBase.replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(tokenPlain)}`;

    const subject = "Password reset request";
    const text = [
      "We received a request to reset your password.",
      `Use this link within 1 hour: ${resetUrl}`,
      "If you did not request this, you can ignore this email.",
    ].join("\n");

    const html = `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Reset password</a> (valid for 1 hour).</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

    await EmailService.send(user.email, subject, text, html);
  },

  async resetPassword(tokenPlain: string, newPassword: string): Promise<void> {
    const tokenHash = createHash("sha256").update(tokenPlain).digest("hex");
    const now = new Date();

    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, now),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!row) {
      throw unauthorized("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, row.userId));
    await db.update(passwordResetTokens).set({ usedAt: now }).where(eq(passwordResetTokens.id, row.id));
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, row.userId));
  },
};
