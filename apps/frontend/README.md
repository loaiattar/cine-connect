# CinéConnect frontend (React + TypeScript + Vite)

## Docker image and `VITE_*` build arguments

The production image (`apps/frontend/Dockerfile`) runs `pnpm build` with environment variables **baked in by Vite**. Nginx only serves static files; it does **not** inject API URLs at runtime.

| Build arg / env | Default | Purpose |
|-----------------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:3000` | Backend origin (no trailing slash). Must be reachable from the **browser**. |
| `VITE_APP_NAME` | `CinéConnect` | Optional branding (reserved for future use). |
| `VITE_TMDB_IMAGE_BASE_URL` | `https://image.tmdb.org/t/p` | TMDB poster base URL. |

**docker compose** (from monorepo root): add `VITE_API_BASE_URL` to root `.env` (see `../../.env.example`). Compose passes it as a build arg. Then:

```bash
docker compose build frontend
docker compose up
```

**Manual image build:**

```bash
docker build -f apps/frontend/Dockerfile --build-arg VITE_API_BASE_URL=https://api.example.com -t cine-frontend ..
```

(context must be monorepo root because the Dockerfile copies workspace files.)

### Smoke-test

1. Start stack: `docker compose up` (backend on `3000`, frontend on `8080`).  
2. Open `http://localhost:8080`.  
3. In DevTools → Network, confirm XHR/fetch targets your configured API host (`/api/v1/...`).

### CI (GitHub Actions)

Workflow `.github/workflows/docker-deploy.yml` passes `VITE_API_BASE_URL` from repository **Variables** (`vars.VITE_API_BASE_URL`). Set that variable in the repo settings for production deploys (public API URL).

---

## React + TypeScript + Vite (template)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
