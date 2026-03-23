# CinéConnect

Movie platform monorepo built with pnpm workspaces and Turbo.

## Quick Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Enable CLI Shortcut

The project includes cross-platform wrapper scripts that let you use `./p` instead of `pnpm`:

**macOS/Linux/Git Bash:**
```bash
chmod +x p          # One-time setup
./p gg              # Use the shortcut
```

**Windows PowerShell:**
```powershell
.\p gg              # Use the shortcut (no setup needed)
```

**Windows Command Prompt:**
```cmd
p gg                # Use the shortcut (no setup needed)
```

Now you can use `./p gac`, `./p gg`, etc. instead of `pnpm gac`, `pnpm gg`.

## Available Commands

| Command | Description |
|---------|-------------|
| `p gac` | Add all files and commit (manual) |
| `p gp` | Push to GitHub and watch pipeline |
| `p cb` | Change branch (interactive) |
| `p gt` | Get current branch |
| `p db` | Start Docker database |
| `p gen component <Name>` | Generate React component |
| `p gg` | Show CLI menu |

## Project Structure

```
cine-connect/
├── apps/
│   ├── frontend/    # React + Vite
│   └── backend/     # Express + TypeScript
├── packages/
│   └── shared/      # Shared types and utilities
└── docs/
```

## Development

```bash
# Run all apps in dev mode
pnpm dev

# Build all apps
pnpm build

# Run linting
pnpm lint

# Type check entire monorepo
pnpm tsc -b
```

## Docker (frontend build)

The frontend container is a static nginx bundle. **`VITE_*` variables are applied at image build time** (not when the container starts). For `docker compose`, set `VITE_API_BASE_URL` in the repo root `.env` — see `.env.example`. Rebuild after changing them: `docker compose build frontend`.

Details: `apps/frontend/README.md` (Docker & Vite).

### Docker Compose healthchecks

Services define **healthchecks** so Compose can wait for readiness:

| Service   | Check |
|-----------|--------|
| **db** / **cine-db-test** | `pg_isready` (existing) |
| **backend** | `GET /health` via Node `fetch` on `127.0.0.1:3000` — expects HTTP 200 when the DB is reachable |
| **frontend** | `wget` to nginx on port 80 |

**Startup order:** `backend` waits until **db** is healthy; **frontend** waits until **backend** is healthy (`depends_on: condition: service_healthy`).

The same checks are mirrored as `HEALTHCHECK` in `apps/backend/Dockerfile` and `apps/frontend/Dockerfile` for standalone `docker run`.

## Backend environment

See `apps/backend/.env.example`. In **production**, `JWT_SECRET` is required and must not be the test default; the app will fail to start if it is missing or insecure. In test, a fallback is allowed so tests can run without setting it.

### Database seed

From the backend package or monorepo root, run:

```bash
pnpm --filter backend db:seed
```

or from `apps/backend`:

```bash
pnpm db:seed
```

The seed script loads `apps/backend/.env` from the backend package root (not from the current working directory), so the same env is used whether you run from the backend dir or from the repo root.
