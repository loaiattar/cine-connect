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

RUN pnpm run build --filter=frontend

FROM nginx:stable-alpine

COPY --from=build /usr/src/app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]