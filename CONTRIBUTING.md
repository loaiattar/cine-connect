# Contributing

## Before you open a PR

From the repository root, after `pnpm install`:

| Check | Command |
|--------|---------|
| **TypeScript** | `pnpm typecheck` |
| **Lint** | `pnpm lint` |
| **Tests** | `pnpm test` (see below for backend DB requirements) |

`pnpm typecheck` runs `tsc --noEmit` for **@cine-connect/shared** and **backend**, and for **frontend** runs route codegen (`tsr generate`) then `tsc -p tsconfig.app.json`. This matches the **typecheck** job in GitHub Actions (`.github/workflows/tests.yml`).

Backend tests need PostgreSQL (see `apps/backend/README.md` or use Docker as in the root README). Frontend and shared typechecks do not require a database.

## Project conventions

- **Package manager:** pnpm workspaces (`pnpm --filter <name> <script>`).
- **Task runner:** Turbo (`turbo run build`, `turbo run typecheck`, etc.).
