# syntax=docker/dockerfile:1.7

# Lesson from Civion Safe: NEXT_PUBLIC_* must be Docker build args (ARG + ENV),
# not runtime env vars — Next.js inlines them at build time.
# node:22-alpine, resolved 2026-07-31 via: docker buildx imagetools inspect node:22-alpine
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile --filter @maki/web...

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN
ENV NEXT_PUBLIC_PLAUSIBLE_DOMAIN=$NEXT_PUBLIC_PLAUSIBLE_DOMAIN
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json ./
COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY packages/i18n ./packages/i18n
COPY packages/ui ./packages/ui
COPY apps/web ./apps/web
RUN pnpm --filter @maki/web build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/healthz || exit 1
CMD ["node", "apps/web/server.js"]
