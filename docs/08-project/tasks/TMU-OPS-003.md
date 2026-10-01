---
id: TMU-OPS-003
title: Next.js web app shell with i18n and unit test harness
status: REVIEW
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

- [x] `pnpm --filter @temuunair/web build` succeeds.
- [x] `pnpm i18n:check` passes with `id.json` and `en.json` present and in parity, including all
      BE-04 error keys and BE-08 notification keys.
- [x] A smoke component test renders the root layout in `id` and asserts the locale switch to `en`.
- [x] No page under `apps/web/src/app` fetches data yet; no `console.log`; no raw hex in components.
- [x] `pnpm gate` green.

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
| 2026-10-01 | qa-engineer | 4 RED | tests written: `apps/web/src/i18n/messages.test.ts` (5 tests), `apps/web/src/app/layout.test.tsx` (3), `apps/web/src/app/page.test.tsx` (2); `pnpm -s vitest run apps/web/src` → 1 failed suite (`Cannot find module './messages/id.json'`), 2 unhandled errors (`Cannot find package 'jsdom'` — deps land in GREEN) |
| 2026-10-01 | general (GREEN) | 5 GREEN | `apps/web` scaffolded per spike-validated design: package/tsconfig/next/postcss/vitest/eslint configs, `src/i18n/{request.ts,messages/{id,en}.json}`, `src/middleware.ts`, `src/styles/theme.css`, `src/app/{layout,page}.tsx`; `pnpm i` updated `pnpm-lock.yaml`; focused run `vitest run apps/web/src` → 3 files / 10 tests green; `i18n:check` → `passed (70 keys per locale)`; `next build` → Compiled successfully (`/` dynamic + middleware) |
| 2026-10-01 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` (unit: 5 files / 46 tests, incl. new 10); generated `apps/web/next-env.d.ts` (untracked, not in lane) tripped `pnpm lint` (`triple-slash-reference`) → removed before gate; shared-config fix filed as TMU-OPS-018 |
| 2026-10-01 | git-steward | 8 COMMIT/PUSH | `18a16d5` `feat(web): add Next.js web app shell with i18n and tests` (19 files: 16 `apps/web` + lockfile + 2 task docs); pushed; PR #10 updated |
| 2026-10-01 | reviewer | 9 REVIEW cycle 1 | `REQUEST_CHANGES` — MAJOR F1 (vacuous placeholder-parity test), MINOR F2–F6; full document in `docs/08-project/reviews/TMU-OPS-003.md` |
| 2026-10-01 | general (fix) | 5 GREEN (fix) | F1 `flatten` → clean dotted keys + mutation proof (red: `notification.ADMIN_DISPUTE.body` mismatch → restore → 5/5 green); F3 invented `metadata.description` removed; F4 axe assertion added to `page.test.tsx` (0 violations, 11th test); F6 `--font-weight-*` + `--duration-*` from tokens.json with `@theme static`; gate → 47 tests green |
| 2026-10-01 | git-steward | 8 COMMIT/PUSH | `2520bfa` `fix(web): run the placeholder parity test and address review cycle 1` (8 files: 4 `apps/web` + 4 docs); pushed; gate re-verified 47/47 pre-commit |
| 2026-10-01 | reviewer | 9 REVIEW cycle 2 | **APPROVE** — F1–F6 all resolved (F5 by filing into TMU-OPS-018); `@theme static` accepted; notes N1 (duplicate rows → fixed here), N2 (ease comment → fixed in final commit), N3 (OPS-017 cross-branch task file → noted in that task) |

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
- **JSX transform under root Vitest (spike-proven, 2026-10-01)**: root `vitest run` compiles `.tsx` with esbuild's *classic* runtime (`React.createElement`) because the nearest tsconfig for `apps/web/src/**` is `apps/web/tsconfig.json`, which Next pins to `jsx: preserve` (Next rewrites it back on every build). The clean fix (`apps/web/src/tsconfig.json` with `react-jsx`) is outside the `fe` lane. Therefore every `.tsx` file under `apps/web/src` (product and tests) starts with `/** @jsxRuntime automatic */`; verified against both `vitest run` and `next build`.
- **next-intl 3.26 specifics (spike-proven)**: `getRequestConfig` must use `requestLocale` (the `locale` param is deprecated); set `timeZone: "Asia/Jakarta"` (silences `ENVIRONMENT_FALLBACK`, matches FE-08 §5); the root layout needs `export const dynamic = "force-dynamic"` — `getLocale`/`getMessages` read `headers`, and without it `next build` fails prerendering `/`.
- **Harness**: `jsdom` + `@testing-library/react` + `jest-axe`; component tests opt in per file via `// @vitest-environment jsdom` (per `packages/config/vitest.base.ts`); root `vitest run` discovers `apps/web/**/*.test.{ts,tsx}`.
- `notification.*` copy follows `13-notification-and-email-templates.md` (BE-08 names it the copy source) where `09-content-and-microcopy.md` differs; `error.*` copy follows `09-content-and-microcopy.md`.
- **Generated `apps/web/next-env.d.ts` (finding, 2026-10-01)**: `next build` writes it with
  CRLF + triple-slash references. Prettier passes after `prettier --write apps/web`, but the
  shared ESLint preset (`packages/config`, ops lane) has no ignore for `**/next-env.d.ts`, so
  `pnpm lint`/`pnpm gate` fail when the file is present (and a local `gate:full` re-run after a
  build would too; CI is unaffected — no build step). The file is untracked and outside the
  `fe` lane, so it was removed before the gate run; fixes (gitignore + eslint ignore, plus
  root-vitest `esbuild.jsx: "automatic"` so future `.tsx` files need no pragma) filed as
  **TMU-OPS-018** (ops lane).

## Evidence

- Red: 2026-10-01 qa-engineer wrote `apps/web/src/i18n/messages.test.ts` (5 tests),
  `apps/web/src/app/layout.test.tsx` (3 tests), `apps/web/src/app/page.test.tsx` (2 tests).
  `pnpm -s vitest run apps/web/src` fails for the right reason — product files absent:
  - `apps/web/src/i18n/messages.test.ts`: `Error: Cannot find module './messages/id.json'
    imported from 'E:/wt/TMU-OPS-003/apps/web/src/i18n/messages.test.ts'` →
    `Failed to load url ./messages/id.json … Does the file exist?`
  - `apps/web/src/app/layout.test.tsx` / `page.test.tsx`: jsdom environment cannot start yet
    because the harness deps (`jsdom`, `@testing-library/react`, `jest-axe`, `next-intl`) are
    not installed in this worktree; the missing product modules `./layout` / `./page` were
    proven with temporary node-env probes (since removed) →
    `Error: Cannot find module './layout' imported from …/red-probe-layout.test.ts`.
  - `pnpm -s i18n:check` → `i18n:check skipped (message files not created yet — M3)` (exit 0),
    as expected before GREEN creates the JSON files.
- Green: 2026-10-01 — `pnpm -s vitest run apps/web/src` → `3 passed (3)` / `10 passed (10)`
  (messages 5, layout 3, page 2); `pnpm -s i18n:check` → `i18n:check passed (70 keys per locale)`;
  `pnpm --filter @temuunair/web build` → `✓ Compiled successfully`, routes `/` and `/_not-found`
  (ƒ dynamic; middleware 55.6 kB); `pnpm gate` → `OK gate(quick) passed`, exit 0
  (unit `5 passed (5)` files / `46 passed (46)` tests — baseline 36 + new 10).
  Fix-loop note: one transient `config-presets.test.mjs` ESLint cold-start timeout (5 s, first run
  after install) — passed on re-run; no code change.
- Review cycle 1 fix (2026-10-01): mutation proof for F1 — removed `{claimShortId}` from
  `notification.ADMIN_DISPUTE.body` in `en` only → placeholder test failed with
  `notification.ADMIN_DISPUTE.body: id=[claimShortId] en=[]` (proving it now executes);
  restored → 5/5 green. After F4 the suite is `3 files / 11 tests`; final gate
  `OK gate(quick) passed` with `47 passed (47)`.
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/10 — `agent/fe/TMU-OPS-003-web-app-shell`,
  commits `4655e5d` (claim) + `18a16d5` (GREEN).
- Review: cycle 1 — `REQUEST_CHANGES` (MAJOR F1, MINOR F2–F6) →
  `docs/08-project/reviews/TMU-OPS-003.md`; F1/F3/F4/F6 fixed, F2 resolved in this file,
  F5 filed into TMU-OPS-018. Cycle 2 pending.

## Blockers

(none)
