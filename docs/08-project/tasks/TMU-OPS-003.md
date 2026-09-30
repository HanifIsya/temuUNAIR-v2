---
id: TMU-OPS-003
title: Next.js web app shell with i18n and unit test harness
status: IN_PROGRESS
lane: fe
slug: web-app-shell
milestone: M0
priority: P1
owner: frontend-dev
deps: [TMU-OPS-002]
refs: [ARCH-STACK, FE-01, FE-08, FE-12]
created: 2026-09-29
updated: 2026-10-01
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
| 2026-10-01 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-003` rebased onto `origin/main` @ `76124aa`; `pnpm i --frozen-lockfile` ok; baseline `pnpm gate` green (36 tests) |
| 2026-10-01 | orchestrator | 1 PICK | claim push to `agent/fe/TMU-OPS-003-web-app-shell` |

### Plan

1. DoR waiver: dep TMU-OPS-002 shows REVIEW in its file but PR #5 is merged (`b9d6ba6`) — proceed.
2. Scaffold `apps/web` (`@temuunair/web`): Next 15 + React 19 + Tailwind 4 on `@temuunair/config` presets; scripts `build`/`dev`/`start`.
3. Wire next-intl without i18n routing: `src/i18n/request.ts` (cookie → Accept-Language → `id`), plugin in `next.config.ts`.
4. Generate `src/i18n/messages/{id,en}.json`: all BE-04 `error.<code>` + BE-08 `notification.<TYPE>.title|body`, copy from DSG microcopy/templates, identical ICU placeholders.
5. `src/styles/theme.css` from `docs/02-design/tokens.json`; root layout (`<html lang>` + provider) + placeholder home.
6. RED: `src/i18n/messages.test.ts` + `src/app/layout.test.tsx` (renderToStaticMarkup, mock `next-intl/server`) via qa-engineer.
7. GREEN via general agent (frontend-dev cannot write worktree paths — permission deviation, precedent OPS-002).
8. Evidence: `pnpm i18n:check`, `pnpm --filter @temuunair/web build`, smoke test output, `pnpm gate`.
9. Prerequisite: TMU-OPS-017 (e2e CI guard fix, ops lane) must merge before this PR's CI can be green.

### Notes

- Permission deviation (recorded for review): `frontend-dev` writes are anchored to the main checkout, so GREEN is delegated to a `general` agent running the frontend-dev playbook; the review file is transcribed into this worktree by the orchestrator. Precedent: TMU-OPS-002.
- e2e CI job guard (`.github/workflows/ci.yml`) flips on when `apps/web/package.json` lands and then fails at root `pnpm exec playwright install` (spike-proven: root `.bin` has no playwright). Fix is ops-lane → filed as TMU-OPS-017; do not edit root/CI files here.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
