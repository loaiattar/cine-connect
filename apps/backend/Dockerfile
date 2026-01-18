# Stage 1: Build
FROM node:20-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend ./apps/backend
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm run build --filter=backend

# Stage 2: Runtime
FROM node:20-slim AS runtime
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/apps/backend/dist ./dist
COPY --from=build /usr/src/app/apps/backend/package.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/index.js"]