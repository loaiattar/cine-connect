# Stage 1: Build
FROM node:20-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps/frontend ./apps/frontend
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# Vite inlines `import.meta.env.VITE_*` at build time — must be set here, not at nginx runtime.
# No default: production bundles must not ship with an implicit API URL (see issue #341).
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME=CinéConnect
# Optional TMDB image CDN base (must match `utils.ts` default if unchanged)
ARG VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_TMDB_IMAGE_BASE_URL=${VITE_TMDB_IMAGE_BASE_URL}

RUN pnpm run build --filter=frontend

FROM nginx:stable-alpine

COPY apps/frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]