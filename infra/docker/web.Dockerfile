# Multi-stage Dockerfile for @temuunair/web (TMU-OPS-012)
# Pinned Node and pnpm versions per repository standard

# Stage 1: Base image with globally installed pnpm
FROM node:24.12.0-bookworm-slim AS base
RUN npm install -g pnpm@10.34.6

# Stage 2: Install workspace dependencies
FROM base AS deps
WORKDIR /app

# Copy root workspace manifests and package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Patch files referenced by pnpm.patchedDependencies must exist before install
COPY patches/ ./patches/
COPY packages/config/package.json ./packages/config/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/
COPY apps/worker/package.json ./apps/worker/

RUN pnpm install --frozen-lockfile

# Stage 3: Build the application and prune devDependencies
FROM base AS builder
WORKDIR /app

COPY --from=deps /app ./
COPY . .

ENV NODE_ENV=production
RUN pnpm --filter @temuunair/web build

# Prune devDependencies to keep the runner image lean
RUN pnpm prune --prod

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV HOME="/home/nextjs"

# Create non-root system user with explicit home directory
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs --home /home/nextjs nextjs

# Copy pruned workspace and built artifacts
COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs

EXPOSE 3000

CMD ["pnpm", "--filter", "@temuunair/web", "start"]
