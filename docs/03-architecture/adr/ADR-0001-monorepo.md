---
id: ADR-0001
title: Monorepo with pnpm workspaces and Turborepo
status: accepted
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-STACK"]
source_refs: ["Blueprint §2, §3"]
---

# ADR-0001 — Monorepo with pnpm workspaces and Turborepo

## Context

TemuUNAIR has a Next.js web app, a worker, an ML service, shared contracts, DB schema and UI
primitives. Agents work in parallel lanes and contracts must be shared as code.

## Options

1. **Polyrepo** — separate repos per app. Clear ownership, but contract drift is easy and
   cross-repo PRs slow the loop.
2. **Monorepo with npm/yarn workspaces** — one repo, weaker workspace protocol, slower installs.
3. **Monorepo with pnpm + Turborepo** — strict dependency isolation, fast installs, cached
   task graph, one CI pipeline.

## Decision

Option 3. `apps/*`, `packages/*`, `services/ml`, `tests/*`, `docs/*` in one repo, pnpm
workspaces with `workspace:*` protocol, Turborepo for `build`/`test`/`lint` caching.

## Consequences

- Contracts (`packages/contracts`) are importable by FE and BE with zero publishing overhead —
  directly supports principle P2.
- One CI pipeline and one branch-protection ruleset; lanes are enforced by paths, not repos.
- Python ML service stays in the same repo but with its own toolchain (`uv`), excluded from pnpm
  tasks except lint/test invocation.
- Cost: repo-wide tooling churn affects everyone; mitigated by pinned versions and Turborepo
  caching.
- Cost: agents must respect lane boundaries (`.agent/lanes.json`) more carefully than in a
  polyrepo; enforced by `check-lane.sh`.
