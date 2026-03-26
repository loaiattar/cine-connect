# CinéConnect Backend

REST API and real-time discussion (Socket.io) for CinéConnect.

## REST API

- **Base URL:** `http://localhost:3000` (or your `PORT`)
- **Docs:** `/docs` or `/?docs=1`
- **OpenAPI spec:** `/openapi.json`
- **API prefix:** versioned JSON routes live under `/api/v1/` (e.g. `/api/v1/auth/login`).
- **Auth (httpOnly cookies):** `POST /api/v1/auth/register`, `POST /api/v1/auth/login` set `cc_access` (JWT) and `cc_refresh` (opaque refresh token) as **httpOnly** cookies (`path: /`). JSON responses include only `{ userId, email }` (no tokens in the body). **Production:** `Secure: true`, `SameSite: Lax` (see `src/utils/authCookies.ts`). **CSRF:** with `SameSite=Lax`, cross-site POSTs do not send cookies; for same-site SPAs, `fetch` with `credentials: 'include'` is enough. If you ever host the SPA on a different site than the API without same-site cookies, add explicit CSRF protection (e.g. double-submit or header token). `POST /api/v1/auth/refresh` reads `cc_refresh` from the cookie (rotation); `POST /api/v1/auth/logout` clears both cookies. Protected routes accept the access JWT from the **`cc_access` cookie** or, for tools/tests, `Authorization: Bearer <token>`.
- **Profile:** `GET /api/v1/users/me` — current user and profile (requires auth); `PUT /api/v1/users/me` — update profile (bio, avatarUrl, location, favoriteGenre; body validated with Zod; requires auth).
- **Follows:** `POST /api/v1/follows` — follow a user (body: `{ followingId }`; requires auth); `DELETE /api/v1/follows/:userId` — unfollow (requires auth); `GET /api/v1/users/:userId/followers` and `GET /api/v1/users/:userId/following` — paginated lists (public; optional `limit`, `offset`).
- **Chat history:** `GET /api/v1/messages?room=<roomId>&limit=50&offset=0` — paginated message history for a room (requires auth).

## WebSocket (Socket.io) — real-time discussion

The same server exposes a Socket.io endpoint for real-time chat. Use the **same origin** as the HTTP API (e.g. `http://localhost:3000`). The client connects to that origin; Socket.io handles the WebSocket path (`/socket.io` by default).

### Connection and authentication

- **Connect:** `io("http://localhost:3000")` (or your API origin). The browser client should use **`withCredentials: true`** so the handshake sends the **`cc_access`** cookie (same host as the API, or a proxied same-origin setup in dev).
- **Optional (non-cookie clients):** `auth: { token: "<jwt>" }` is still supported for tooling.
- If no valid session, the socket still connects; `userId` / `email` will be undefined (anonymous). CORS/origin validation uses the same env as the REST API (`FRONTEND_ORIGIN` / `CORS_ORIGINS`); credentialed browser clients need `credentials: true` on CORS.

### Room model

- Rooms are identified by a string **roomId**.
- **Global room:** `"global"`.
- **Per-film room:** `"film:<movieId>"` (e.g. `"film:550"`).

### Events (client → server)

| Event        | Payload                    | Description                    |
|-------------|----------------------------|--------------------------------|
| `join_room` | `roomId: string`           | Join a discussion room.        |
| `leave_room`| `roomId: string`           | Leave a room.                  |
| `message`   | `{ roomId: string; text: string }` | Send a chat message to the room. |

### Events (server → client)

| Event        | Payload                                                                 |
|-------------|-------------------------------------------------------------------------|
| `message`   | `{ roomId, text, userId?, email?, timestamp }` — also persisted to DB   |
| `message_history` | `{ roomId, messages }` — sent to the joining client when they join a room |
| `user_joined` | `{ roomId, userId?, email?, socketId }`                              |
| `user_left` | `{ roomId, userId?, socketId }`                                        |

### Example (client)

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true, // send cc_access cookie when same-origin / credentialed
});

socket.emit("join_room", "global");
socket.on("message", (msg) => console.log("message", msg));
socket.on("message_history", (data) => console.log("message_history", data)); // recent messages for the room
socket.on("user_joined", (data) => console.log("user_joined", data));
socket.emit("message", { roomId: "global", text: "Hello!" }); // persisted to DB and broadcast to room
```

## Tests

- **Run tests:** `pnpm test` (runs Vitest; requires PostgreSQL and `TMDB_API_KEY` in test env). Integration tests hit the real app and database; unit tests cover helpers (`apiResponse`, `AppError`, `sanitizeUserText`, `errorHandler`, `asyncHandler`) and HTTP edge cases (404, malformed JSON, unauthenticated API) without extra setup.
- **Coverage:** `pnpm test:coverage` — generates a coverage report (requires `@vitest/coverage-v8`). Auth REST tests run whenever the suite runs (same as other DB-backed tests); ensure PostgreSQL is up so the full suite passes in CI.

## API breaking changes

- **GET `/api/v1/movies/:movieId` — removed `?userId=` query (privacy).** Personalized favorite/watchlist flags use **only** the authenticated user from the Bearer JWT (`optionalAuthMiddleware`). Unauthenticated requests always get `isFavorite: false` and `isOnWatchlist: false`. Clients must not rely on passing another user’s id in the query string.

## Security headers

The API uses [Helmet](https://helmetjs.github.io/) early in the Express stack (`src/app.ts`) for standard headers (e.g. `X-Content-Type-Options`, `X-DNS-Prefetch-Control`, frameguard, etc.) and a **Content-Security-Policy** tuned for this app.

**CSP exceptions** (required for in-browser Swagger UI at `/docs`, `/swagger`, and related routes):

| Directive     | Values | Why |
|---------------|--------|-----|
| `script-src`  | `'self'`, `'unsafe-inline'`, `'unsafe-eval'`, `https://unpkg.com` | Inline boot script in the HTML shell; Swagger UI bundle from unpkg; dynamic eval paths inside Swagger. |
| `style-src`   | `'self'`, `'unsafe-inline'`, `https://unpkg.com` | Swagger UI CSS from unpkg; inline styles. |
| `connect-src` | `'self'` | Browser fetches `/openapi.json` same-origin. |
| `img-src`     | `'self'`, `data:`, `https:` | Icons / assets from CDNs or data URLs. |
| `font-src`    | `'self'`, `https:`, `data:` | Fonts loaded by Swagger UI from HTTPS. |

`crossOriginEmbedderPolicy` is disabled so typical cross-origin browser clients (SPA + API) are not blocked by default COEP behavior on JSON responses.

## Environment

- `DATABASE_URL` — PostgreSQL connection string.
- `JWT_SECRET` — Secret for signing JWTs (always required; at least 32 characters when `NODE_ENV` is `production`).
- `TMDB_API_KEY` — For movie data (required when not in test).
- `PORT` — Server port (default `3000`).
- `FRONTEND_ORIGIN` or `CORS_ORIGINS` — Allowed origins for REST and Socket.io.
