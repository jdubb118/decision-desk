# Multi-stage build:
#   1. deps + frontend build against a full node image
#   2. tiny runtime image with only the built dist/ + node_modules needed
#
# The runtime image runs as a non-root user, owns /app/data via the volume
# mount, and exposes 3335.

# ---------- builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Native modules need a toolchain (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY src ./src
RUN npm run build

# Strip dev dependencies so node_modules is lean for the runtime stage
RUN npm prune --omit=dev


# ---------- runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

# Non-root user with predictable UID so bind-mounts behave
RUN addgroup -S desk && adduser -S desk -G desk

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY server.mjs ./server.mjs
COPY package.json ./package.json

# Runtime config + data live under /app/data (mount a volume here).
RUN mkdir -p /app/data && chown -R desk:desk /app

USER desk
EXPOSE 3335

ENV HOST=0.0.0.0 \
    PORT=3335 \
    DECISION_DESK_DATA_DIR=/app/data

CMD ["node", "server.mjs"]
