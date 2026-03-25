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

## Local dev: Vite proxy and httpOnly auth cookies

The API stores JWTs in **`cc_access` / `cc_refresh`** (httpOnly cookies). The SPA uses **`fetch(..., { credentials: 'include' })`** and Socket.io **`withCredentials: true`**.

- **Recommended:** leave **`VITE_API_BASE_URL` unset** (or empty) in dev so requests go to the Vite dev server origin. `vite.config.ts` proxies **`/api`** and **`/socket.io`** to the backend (`VITE_API_PROXY_TARGET`, default `http://localhost:3000`). Cookies stay **first-party**, so **SameSite=Lax** works for same-site POSTs (e.g. refresh) without extra CSRF headers.
- **Cross-origin dev:** set **`VITE_API_BASE_URL=http://localhost:3000`** (or your API URL). The browser must treat the SPA origin as allowed in the backend CORS config (`credentials: true` on both sides).

On startup, `main.tsx` waits for Zustand persist hydration, then may call **`POST /api/v1/auth/refresh`** once to repopulate the store from cookies if there is no cached user.

---

## App shell and mobile navigation (Glass v2)

Authenticated routes render inside **`AppShell`** with **`SidebarNav`** (`src/components/layout/AppShell.tsx`, `SidebarNav.tsx`).

| Viewport | Navigation |
|----------|------------|
| **`md` and up** | Fixed left **rail** (icons only; expands on hover or keyboard focus-within). |
| **Below `md`** | **Sticky top bar** (menu control + CinéConnect title) and a **left drawer** (Radix `Dialog`) with full text labels for every destination and account actions. The rail is hidden so main content can use the full width. |

`AppShell` main uses `min-w-0`, `max-w-full`, and `overflow-x-hidden` so wide pages or glass panels are less likely to cause horizontal scrolling on small screens (plan milestone C.8, issue #314).

---

## Accessibility preferences (Glass v2)

Issue #316 (plan §1 + §5 D.10) is implemented:

- **Reduced transparency:** `src/index.css` defines `@media (prefers-reduced-transparency: reduce)` and switches glass tokens to mostly solid zinc surfaces (`--glass-bg`, `--glass-bg-elevated`) while setting `--glass-blur: 0px`.
- **Reduced motion:** animated UI pieces use `motion-reduce:*` variants (sidebar label/rail transitions, drawer animations, poster hover zoom, progress-bar width transitions) so motion-heavy effects are removed when the OS/browser requests reduced motion.

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
