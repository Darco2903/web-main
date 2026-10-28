# platform-independent output (no native deps), so install/build run natively, not under QEMU
FROM --platform=$BUILDPLATFORM ghcr.io/pnpm/pnpm:latest AS base
ENV CI=true
RUN pnpm runtime set node 24 -g
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY client/package.json client/
COPY server/package.json server/

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter server install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY client/src/ /app/client/src/
COPY server/src/ /app/server/src/
COPY client/env.d.ts client/index.html client/tsconfig*.json client/vite.config.ts client/
COPY client/public/ /app/client/public/
COPY server/tsconfig.json server/
RUN pnpm build

FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# node_modules
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/server/node_modules /app/server/node_modules
# dist
COPY --from=build /app/client/dist /app/client/dist
COPY --from=build /app/server/dist /app/server/dist
COPY --from=build /app/package.json /app/
COPY --from=build /app/server/package.json /app/server/

CMD ["node", "."]
