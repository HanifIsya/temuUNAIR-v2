---
id: TMU-OPS-003
title: Next.js web app shell with i18n and unit test harness
status: TODO
lane: fe
slug: web-app-shell
milestone: M0
priority: P1
owner: frontend-dev
deps: [TMU-OPS-002]
refs: [ARCH-STACK, FE-01, FE-08, FE-12]
created: 2026-09-29
updated: 2026-09-30
---

# TMU-OPS-003 — Next.js web app shell with i18n and unit test harness

## Goal

Stand up `apps/web` as a buildable Next.js App Router workspace package with next-intl wired
for `id`/`en`, a Vitest component-test harness, and the `id.json`/`en.json` message files that
`scripts/i18n-check.mjs` expects — so M3 feature tasks start from a running shell instead of a
blank directory.

## Context

- `docs/04-contracts/frontend/FE-01-route-map.md` defines the routes this shell must be able to host.
- `docs/04-contracts/frontend/FE-08-i18n-keys.md` requires `id` default and `en` mirror.
- `scripts/i18n-check.mjs` fails until every BE-04 `error.<code>` and BE-08
  `notification.<TYPE>.title|body` key exists in both locales.
- `docs/03-architecture/02-tech-stack-and-versions.md`: Next 15, React 19, Tailwind 4, Zod,
  TanStack Query 5, next-intl 3.
- `infra/docker/web.Dockerfile` is the `ops` lane (`.agent/lanes.json`), so it is **not** part of
  this task: TMU-OPS-012 ships it and enables the `docker-build` CI job (guarded in TMU-OPS-011).
  This task must not add `infra/**` files.

## Acceptance criteria

- [ ] `pnpm --filter @temuunair/web build` succeeds.
- [ ] `pnpm i18n:check` passes with `id.json` and `en.json` present and in parity, including all
      BE-04 error keys and BE-08 notification keys.
- [ ] A smoke component test renders the root layout in `id` and asserts the locale switch to `en`.
- [ ] No page under `apps/web/src/app` fetches data yet; no `console.log`; no raw hex in components.
- [ ] `pnpm gate` green.

## Files expected to change

- `apps/web/**` (package.json, tsconfig.json, next.config.ts, postcss.config.mjs,
  eslint.config.mjs, src/app/**, src/i18n/**, src/styles/**, src/**/*.test.tsx)
- `pnpm-lock.yaml` (workspace dependencies)

## Out of scope

- Real screens, data fetching, auth wiring (M3 tasks TMU-FE-001..006).
- Design-token values from the real logo (TMU-DSG-001, M1).
- Server services and route handlers (`apps/web/src/server/**`, be lane).
- Root file changes: the root dispatcher (TMU-OPS-011) already routes `build`; if a root script is
  needed, file it as a follow-up `ops` task instead of editing it here.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | owner → `frontend-dev`; Dockerfile moved to TMU-OPS-012 (ops lane — review BLOCKER 1); folded in (unblocks `docker-build`); root-file edits removed (dispatcher exists) |

### Plan

1. Scaffold `apps/web` with Next 15 + React 19 + Tailwind 4 and the shared config presets.
2. Wire next-intl with `id` default and `en`; generate the full BE-04/BE-08 key set.
3. Add a root layout and one smoke test.
4. `pnpm i18n:check`, `pnpm --filter @temuunair/web build`, `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
