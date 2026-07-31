# syntax=docker/dockerfile:1.7

# Pin base by SHA digest. Lesson: never use floating tags in production.
# To bump: `docker buildx imagetools inspect node:22-alpine` and take the top-level index Digest.
# node:22-alpine, resolved 2026-07-31
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/api/package.json ./services/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile --filter @maki/api...

# Build FROM deps, not FROM base. pnpm workspaces put each package's binaries in
# its own node_modules/.bin, so copying only the root node_modules loses tsc and
# the build dies with "tsc: not found".
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY services/api ./services/api
RUN pnpm --filter @maki/config build \
  && pnpm --filter @maki/types build \
  && pnpm --filter @maki/api build

FROM base AS runtime
ENV NODE_ENV=production
# The workspace packages ship compiled dist, not TS source — Node cannot import
# `@maki/config` if its entrypoint is a .ts file, which is why this image never
# ran before. Their package.json + dist must both be present for the symlinks
# in services/api/node_modules to resolve.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/api/node_modules ./services/api/node_modules
COPY --from=build /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=build /app/packages/config/dist ./packages/config/dist
COPY --from=build /app/packages/config/package.json ./packages/config/
COPY --from=build /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=build /app/packages/types/dist ./packages/types/dist
COPY --from=build /app/packages/types/package.json ./packages/types/
COPY --from=build /app/services/api/dist ./services/api/dist
COPY --from=build /app/services/api/package.json ./services/api/
COPY package.json pnpm-workspace.yaml ./
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3001/healthz || exit 1
CMD ["node", "services/api/dist/index.js"]
