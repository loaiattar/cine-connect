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
