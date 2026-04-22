# syntax=docker/dockerfile:1.7
#
# Multi-stage Dockerfile for the Tor × FtC QF donation tracker.
# See spec §14.1 (process structure) and §17.1 (infra tasks).
#
# TODO (§17.1 task 3): add `monero-wallet-rpc` and `zcashd`/lightwalletd sidecars
# for privacy-chain scanning. Intentionally omitted here to keep the image
# light during v0 scaffolding — they pull in large, architecture-specific
# binaries and their own runtime state. They will land either as sidecar
# containers in docker-compose/k8s or as additional stages here.

# ---------- builder ----------
FROM node:20-alpine AS builder

WORKDIR /build

# Build deps for better-sqlite3 native binding.
RUN apk add --no-cache python3 make g++ libc-dev

# Copy workspace manifests first for layer caching.
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/tracker/package.json ./apps/tracker/

RUN npm install --workspaces --include-workspace-root

# Copy sources and build.
COPY packages/types ./packages/types
COPY apps/tracker ./apps/tracker

RUN npm --workspace @tor/types run build \
 && npm --workspace @tor/tracker run build

# Prune dev deps for runtime.
RUN npm prune --omit=dev --workspaces

# ---------- runtime ----------
FROM node:20-alpine AS runtime

# Non-root user per spec §15 / §17.1 task 3.
RUN addgroup -g 10001 tracker \
 && adduser -D -u 10001 -G tracker -s /sbin/nologin tracker

WORKDIR /app

# Runtime libs for better-sqlite3.
RUN apk add --no-cache libstdc++

COPY --from=builder --chown=tracker:tracker /build/node_modules ./node_modules
COPY --from=builder --chown=tracker:tracker /build/packages/types ./packages/types
COPY --from=builder --chown=tracker:tracker /build/apps/tracker/dist ./apps/tracker/dist
COPY --from=builder --chown=tracker:tracker /build/apps/tracker/package.json ./apps/tracker/package.json
COPY --from=builder --chown=tracker:tracker /build/apps/tracker/src/db/migrations ./apps/tracker/src/db/migrations

# Writable runtime state dirs.
RUN mkdir -p /app/apps/tracker/data /app/apps/tracker/out \
 && chown -R tracker:tracker /app/apps/tracker/data /app/apps/tracker/out

USER tracker

ENV NODE_ENV=production
ENV SNAPSHOT_OUTPUT_PATH=/app/apps/tracker/out/snapshot.json

WORKDIR /app/apps/tracker

EXPOSE 8080

CMD ["node", "dist/index.js"]
