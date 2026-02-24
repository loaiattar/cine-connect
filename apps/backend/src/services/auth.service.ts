import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { conflict } from '../utils';

export const AuthService = {
  async register(name: string, email: string, password: string) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      throw conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).returning();

    return this.generateToken(newUser.id, newUser.email);
  },

  async login(email: string, password: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    return this.generateToken(user.id, user.email);
  },

  generateToken(userId: number, email: string) {
    const token = jwt.sign(
      { userId, email },
      getJwtSecret(),
      { expiresIn: '24h' }
    );
    return { token, userId, email };
  }
};