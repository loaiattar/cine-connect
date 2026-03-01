# CinéConnect Backend

REST API and real-time discussion (Socket.io) for CinéConnect.

## REST API

- **Base URL:** `http://localhost:3000` (or your `PORT`)
- **Docs:** `/docs` or `/?docs=1`
- **OpenAPI spec:** `/openapi.json`
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login` — use the returned JWT in `Authorization: Bearer <token>` for protected routes.

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
| `message`   | `{ roomId, text, userId?, email?, timestamp }`                         |
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
socket.on("user_joined", (data) => console.log("user_joined", data));
socket.emit("message", { roomId: "global", text: "Hello!" });
```

## Environment

- `DATABASE_URL` — PostgreSQL connection string.
- `JWT_SECRET` — Secret for signing JWTs (required when `NODE_ENV` !== `"test"`).
- `TMDB_API_KEY` — For movie data (required when not in test).
- `PORT` — Server port (default `3000`).
- `FRONTEND_ORIGIN` or `CORS_ORIGINS` — Allowed origins for REST and Socket.io.
