---
id: TMU-OPS-037
title: Vitest — resolve `@/*` via vite-tsconfig-paths (FE lane unblocker)
status: DONE
lane: ops
slug: vitest-tsconfig-paths
milestone: M3
priority: P1
owner: ops-dev
deps: []
refs: [WF-STANDARDS, FE-04, TMU-FE-001]
created: 2026-10-05
updated: 2026-10-05
---

# TMU-OPS-037 — Vitest: resolve `@/*` via vite-tsconfig-paths

## Goal

`WF-STANDARDS` mandates absolute imports (`@/…`) for `apps/web/src`, but the root
Vitest config has no tsconfig-paths plugin: a probe test importing
`@/i18n/messages/id.json` fails with `Cannot find package '@/…'`. Every frontend
route nested deeper than two directories (e.g. `app/(public)/auth/error/*`) therefore
cannot import shared components i18n-free or standards-compliantly — relative chains
would exceed the two-level limit and `@/` fails at test runtime. Add
`vite-tsconfig-paths` to the root Vitest config so tests run with the same resolution
Next.js uses (discovered per-file from `apps/web/tsconfig.json` and
`tsconfig.test.json`).

Filed while starting TMU-FE-001 (DoR research); also unblocks TMU-FE-002..006.

## Acceptance criteria

- [x] Root `vitest.config.ts` loads `vite-tsconfig-paths`.
- [x] A probe test importing `@/i18n/messages/id.json` passes, then is removed.
- [x] `pnpm gate` green (whole suite runs under the new resolution).

## Files expected to change

- `package.json`, `pnpm-lock.yaml`, `vitest.config.ts` (root)
- `docs/08-project/tasks/TMU-OPS-037.md`, `docs/08-project/reviews/TMU-OPS-037.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-05 | backend-dev | 1 PICK | branch `agent/ops/TMU-OPS-037-vitest-tsconfig-paths` from `main` (`bebf844`); raised during TMU-FE-001 DoR research (probe: `Cannot find package '@/i18n/messages/id.json'`) |
| 2026-10-05 | backend-dev | 5 GREEN | root `vitest.config.ts` gains `tsconfigPaths({ projects: ["apps/web/tsconfig.json", "tsconfig.test.json"] })`; probe passed (`1 passed`), removed before commit |
| 2026-10-05 | backend-dev | 7 GATE | `pnpm format` + `pnpm gate` → `OK gate(quick) passed` (46 files / 416 tests — no resolution regressions) |
| 2026-10-05 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** → `docs/08-project/reviews/TMU-OPS-037.md` |
| 2026-10-05 | backend-dev | 10 SHIP | task flipped to DONE; squash-merged to `main` |

## Evidence

- Probe run before: `Error: Cannot find package '@/i18n/messages/id.json'`
  → after: probe `1 passed`; probe file removed before commit.
- Why `projects:`: default discovery only finds `tsconfig.json` files (the root one has
  no `paths`), and `apps/web/tsconfig.json` **excludes** `*.test.ts(x)` — include/exclude
  are respected by the plugin, so tests needed the root `tsconfig.test.json` listed
  explicitly alongside the web config.
- `pnpm gate` → `OK gate(quick) passed` (46 files / 416 tests, contracts 1.1.0, db ok).
- Review: cycle 1 **`APPROVE`** → `docs/08-project/reviews/TMU-OPS-037.md`.
- PR: (local merge per environment rules)

## Definition of Done

See `docs/05-workflow/05-definition-of-ready-done.md`. Evidence above; review verdict in
`docs/08-project/reviews/TMU-OPS-037.md`.
