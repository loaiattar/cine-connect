# --- Stage 1: Build ---
FROM node:20-slim AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN npm install -g typescript

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY . .

RUN tsc -p packages/shared/tsconfig.json
RUN tsc -p apps/backend/tsconfig.json

# --- Stage 2: Runtime ---
FROM node:20-slim AS runner
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /usr/src/app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /usr/src/app/packages/shared/dist ./packages/shared/dist

EXPOSE 3000

ENV IS_DOCKER=true
WORKDIR /usr/src/app/apps/backend

CMD ["node", "dist/index.js"]