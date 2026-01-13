FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build --filter=backend

FROM base AS runtime
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/apps/backend/dist ./dist
COPY --from=build /usr/src/app/apps/backend/package.json ./
RUN pnpm install --prod

EXPOSE 3000
CMD [ "node", "dist/index.js" ]