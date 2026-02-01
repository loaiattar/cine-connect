# CinéConnect

Movie platform monorepo built with pnpm workspaces and Turbo.

## Quick Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Enable CLI Shortcut

The project includes cross-platform wrapper scripts that let you use `p` instead of `pnpm`:

#### Windows
✅ **No setup needed** - Works automatically in PowerShell and Command Prompt

#### macOS/Linux
Run once after cloning to make the script executable:
```bash
chmod +x p
```

Now you can use `p gac`, `p gg`, etc. instead of `pnpm gac`, `pnpm gg`.

## Available Commands

| Command | Description |
|---------|-------------|
| `p gac` | Add all files and commit (AI-generated message) |
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
