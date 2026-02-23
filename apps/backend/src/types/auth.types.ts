/** User entity (matches DB schema) */
export interface User {
  id: number;
  name: string | null;
  email: string;
  password: string;
  createdAt: Date | null;
}

/** JWT payload stored in token */
export interface TokenPayload {
  userId: number;
  email: string;
}

/** Auth response (login/register) */
export interface AuthResult {
  token: string;
  userId: number;
  email: string;
}

/** Express request user (set by auth middleware) */
export interface RequestUser {
  userId: number;
}
