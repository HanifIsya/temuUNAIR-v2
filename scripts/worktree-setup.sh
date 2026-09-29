#!/usr/bin/env bash
# Per-worktree setup hook (Blueprint §7.5). Point Orca's worktree setup hook here.
# Usage: scripts/worktree-setup.sh
set -euo pipefail

if [ ! -f package.json ]; then
  echo "No package.json yet (pre-M3) — nothing to install"
else
  pnpm i --frozen-lockfile
fi

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if [ -f infra/docker-compose.yml ]; then
  docker compose -f infra/docker-compose.yml up -d || echo "compose not available — start it manually"
fi

echo "Worktree ready: $(git branch --show-current)"
