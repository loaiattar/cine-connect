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
# Either set VITE_API_BASE_URL (browser calls that origin) or VITE_SAME_ORIGIN_API=true with empty
# VITE_API_BASE_URL so the SPA calls `/api` on the page origin and nginx proxies (see issue #341).
ARG VITE_SAME_ORIGIN_API=false
ARG VITE_API_BASE_URL=
ARG VITE_APP_NAME=CinéConnect
ARG VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
ENV VITE_SAME_ORIGIN_API=${VITE_SAME_ORIGIN_API}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_TMDB_IMAGE_BASE_URL=${VITE_TMDB_IMAGE_BASE_URL}

# Same-origin builds: force empty VITE_API_BASE_URL (Cloud Build sometimes drops `=`-only args).
RUN if [ "${VITE_SAME_ORIGIN_API}" = "true" ]; then export VITE_API_BASE_URL=; else export VITE_API_BASE_URL="${VITE_API_BASE_URL}"; fi \
    && pnpm run build --filter=frontend

FROM nginx:stable-alpine

# Backend origin for nginx proxy (/api, /uploads, /socket.io). Same value you would use for
# VITE_API_BASE_URL when the browser talks to the API directly; use the hostname nginx can reach
# (e.g. http://backend:3000 in Docker Compose, https://your-backend.run.app on Cloud Build).
ARG NGINX_API_UPSTREAM
COPY apps/frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
RUN test -n "$NGINX_API_UPSTREAM" || (echo "NGINX_API_UPSTREAM build-arg is required" && exit 1) \
    && API_HOST=$(echo "$NGINX_API_UPSTREAM" | sed -E 's|https?://([^/]+).*|\1|') \
    && sed -i "s|__NGINX_API_UPSTREAM__|${NGINX_API_UPSTREAM}|g" /etc/nginx/conf.d/default.conf \
    && sed -i "s|__NGINX_API_HOST__|${API_HOST}|g" /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
