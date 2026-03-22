# CinéConnect Backend

REST API and real-time discussion (Socket.io) for CinéConnect.

## REST API

- **Base URL:** `http://localhost:3000` (or your `PORT`)
- **Docs:** `/docs` or `/?docs=1`
- **OpenAPI spec:** `/openapi.json`
- **API prefix:** versioned JSON routes live under `/api/v1/` (e.g. `/api/v1/auth/login`).
- **Auth:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login` — use the returned JWT in `Authorization: Bearer <token>` for protected routes.
- **Profile:** `GET /api/v1/users/me` — current user and profile (requires auth); `PUT /api/v1/users/me` — update profile (bio, avatarUrl, location, favoriteGenre; body validated with Zod; requires auth).
- **Follows:** `POST /api/v1/follows` — follow a user (body: `{ followingId }`; requires auth); `DELETE /api/v1/follows/:userId` — unfollow (requires auth); `GET /api/v1/users/:userId/followers` and `GET /api/v1/users/:userId/following` — paginated lists (public; optional `limit`, `offset`).
- **Chat history:** `GET /api/v1/messages?room=<roomId>&limit=50&offset=0` — paginated message history for a room (requires auth).

## WebSocket (Socket.io) — real-time discussion

The same server exposes a Socket.io endpoint for real-time chat. Use the **same origin** as the HTTP API (e.g. `http://localhost:3000`). The client connects to that origin; Socket.io handles the WebSocket path (`/socket.io` by default).

### Connection and authentication

- **Connect:** `io("http://localhost:3000")` (or your API origin).
- **Optional auth:** Send the JWT so the server can attach the user to the socket:
  - `io(url, { auth: { token: "<jwt>" } })`  
  - or set `Authorization: Bearer <jwt>` in `extraHeaders` if your client supports it.
- If no token or invalid token, the socket still connects; `userId` / `email` will be undefined (anonymous). CORS/origin validation uses the same env as the REST API (`FRONTEND_ORIGIN` / `CORS_ORIGINS`).

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
  auth: { token: "YOUR_JWT" }, // optional
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

## Environment

- `DATABASE_URL` — PostgreSQL connection string.
- `JWT_SECRET` — Secret for signing JWTs (required when `NODE_ENV` !== `"test"`).
- `TMDB_API_KEY` — For movie data (required when not in test).
- `PORT` — Server port (default `3000`).
- `FRONTEND_ORIGIN` or `CORS_ORIGINS` — Allowed origins for REST and Socket.io.
