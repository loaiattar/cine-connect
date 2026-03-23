import type { RequestUser } from "../auth.types";

/**
 * Merges into `@types/express-serve-static-core`’s `Request`, which extends `Express.Request`.
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-serve-static-core/index.d.ts
 */
declare global {
  namespace Express {
    interface Request {
      /** Set by `authMiddleware` / `optionalAuthMiddleware` when a valid access token is present. */
      user?: RequestUser;
    }
  }
}

export {};
