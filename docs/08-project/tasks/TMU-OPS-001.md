---
id: TMU-OPS-001
title: Root workspace scaffold, gate scripts and lane-map gaps
status: DONE
lane: ops
slug: workspace-scaffold
milestone: M0
priority: P0
owner: orchestrator
deps: []
refs: [BLUEPRINT, ROADMAP, WF-LANES, WF-GATE]
created: 2026-09-29
updated: 2026-09-30
---

# TMU-OPS-001 — Root workspace scaffold, gate scripts and lane-map gaps

## Goal

Make `pnpm gate` runnable end to end from a clean clone: root `package.json` with every
gate script, a pnpm workspace, shared tsconfig/prettier/eslint entry points, and explicit
placeholders for the checks that only become real in M2/M3. Also close the lane-map gaps
that make this scaffold out-of-lane today.

## Context

- `docs/01-product/10-roadmap.md` M0 exit criteria: "`pnpm gate` runs (even if mostly no-op)".
- `docs/05-workflow/02-agent-loop.md` step 0 requires a green `pnpm gate:quick` on a fresh
  `main` before any task can start.
- `scripts/gate.sh` already exists but there is no root `package.json`, no
  `pnpm-workspace.yaml` and no `packages/config`, so no gate step can execute.
- `.agent/lanes.json` (Blueprint §7.5) does not cover `pnpm-workspace.yaml`, `packages/config/**`,
  `apps/web/*` app-level config, or `docs/_source/**` — the files this task and M1 must touch.
  Lane semantics rule 5: fix the map with an `ops` task rather than editing out of lane.

## Acceptance criteria

- [ ] `pnpm install` succeeds from a clean clone with `--frozen-lockfile` and produces a lockfile.
- [ ] `pnpm gate` (quick) exits 0 on `main`-equivalent tree; every step in `scripts/gate.sh`
      reports a result (real or an explicit "pending M2/M3" notice that still exits 0).
- [ ] `pnpm -s format:check`, `lint`, `typecheck`, `i18n:check`, `test:unit`, `contracts:check`,
      `contracts:lint`, `db:check` are all defined and callable.
- [ ] `scripts/check-lane.sh` passes for this branch (no out-of-lane edits).
- [ ] `.agent/lanes.json` covers every file this task adds; no glob overlaps another lane's paths.
- [ ] `scripts/gate.sh` skips the ML step when `services/ml/pyproject.toml` is absent, and runs it
      when present (so the ML skeleton task can enable it without touching `scripts/`).
- [ ] `docs/07-ops/01-local-dev-setup.md` documents the Windows prerequisite for `bash`.

## Files expected to change

- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.npmrc`
- `.prettierrc.json`, `.prettierignore`, `eslint.config.mjs`, `vitest.config.ts`
- `.agent/lanes.json`
- `scripts/gate.sh`
- `scripts/checks/*.mjs` (placeholder gate steps)
- `docs/07-ops/01-local-dev-setup.md`

## Out of scope

- Real ESLint/TS/Vitest presets in `packages/config` (TMU-OPS-002).
- The Next.js app shell (TMU-OPS-003), contracts package (TMU-OPS-004), DB package
  (TMU-OPS-005), ML service (TMU-OPS-006), worker (TMU-OPS-007).
- Any `gate:full` step that needs a running Postgres/browser (TMU-OPS-008).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-29 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-001`, branch `agent/ops/TMU-OPS-001-workspace-scaffold` from `origin/main` @ d8faabe; baseline gate red (no root `package.json`) |
| 2026-09-29 | orchestrator | 1 PICK | `node scripts/next-task.mjs` → `TMU-OPS-001`; 10 M0 task files added; backlog/status regenerated |
| 2026-09-29 | orchestrator | 3 PLAN | plan below |
| 2026-09-29 | orchestrator | 4 RED | `pnpm gate` → `ERR_PNPM_NO_PKG_MANIFEST` (no root package.json); after scaffold, lint step → 47 errors (Node globals undeclared, `no-control-regex`); my scaffold test → `expected [ 'audit' ] to deeply equal []` |
| 2026-09-29 | orchestrator | 5 GREEN | all three reds fixed: root manifest added, `globals`/`@types/node` added, sentinel-based glob translation, `audit` script added |
| 2026-09-29 | orchestrator | 7 GATE | `pnpm gate` → **OK gate(quick) passed** (see Evidence) |
| 2026-09-29 | orchestrator | 7 GATE | `pnpm gate:full` reaches `secret scan` and stops: `gitleaks: command not found` (host prerequisite, TMU-OPS-008) |
| 2026-09-29 | orchestrator | 6 REFACTOR | lane-coverage probe found `apps/web/package.json`, `next.config.ts`, `src/app/layout.tsx`, `src/middleware.ts` and `src/styles/**` owned by **no lane** → would block TMU-OPS-003; added to `fe`, and retagged TMU-OPS-003 from `ops` to `fe` |
| 2026-09-29 | reviewer | 9 REVIEW | verdict **APPROVE**, 8 MINOR, 0 BLOCKER/MAJOR → `docs/08-project/reviews/TMU-OPS-001.md` |
| 2026-09-29 | orchestrator | 9 REVIEW fix | F1 meta/contracts exception now codified in a test; F2 hard-coded id list replaced with a filename↔id invariant; F3 `.npmrc` comments corrected; F5 M0 caveat added to the setup doc; F6 evidence claim corrected; F7 Node globals scoped, browser globals added; F8 `audit` invoked once via the script. F4 (Windows bash shim) filed as a follow-up |
| 2026-09-29 | git-steward | 10 SHIP | pushed `5e000e3`, draft PR https://github.com/HanifIsya/temuUNAIR-v2/pull/1 |
| 2026-09-29 | orchestrator | 11 CI fix (1/3) | CI red: 8 jobs failed with "Multiple versions of pnpm specified" — root `packageManager` now conflicts with `version:` on `pnpm/action-setup@v4`. Dropped the explicit version (pin lives in one place), removed the now-unused `PNPM_VERSION` env, made the `ml` and `e2e` jobs skip honestly until TMU-OPS-006/TMU-OPS-003 land, and routed the `audit` job through the same script as the gate. Added 3 tests asserting the CI/gate wiring |
| 2026-09-30 | orchestrator | 11 CI green | all 11 checks green on `bedf703` (10 pass, `docker-build` skipped by design until TMU-OPS-003); `pnpm gate` re-verified locally: OK gate(quick) passed, 16/16 unit tests |
| 2026-09-30 | docs-keeper | 13 POST-MERGE | merged to `main` as `44d2ce9` (PR [#1](https://github.com/HanifIsya/temuUNAIR-v2/pull/1), merged 2026-09-30T00:32Z); status → `DONE` (TMU-META-001) |

### Plan

1. Extend `.agent/lanes.json` with the scaffold paths (ops) and `docs/_source/**` (docs).
2. Add root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.npmrc`.
3. Add Prettier/ESLint/Vitest entry-point configs that operate on the workspace.
4. Add `scripts/checks/*.mjs` placeholders that print "pending M2/M3" and exit 0.
5. Point `gate.sh`'s ML step at `services/ml/pyproject.toml` instead of the directory.
6. Document the Windows `bash` prerequisite in the local-dev doc.
7. Run `pnpm install` then `pnpm gate`; capture the tail as evidence.

## Evidence

### Red

```
> temuunair@0.0.0 gate
> bash scripts/gate.sh quick
ERR_PNPM_NO_PKG_MANIFEST  No package.json found in E:\wt\TMU-OPS-001
```

After the scaffold landed, the lint step exposed two real defects:

```
E:\wt\TMU-OPS-001\scripts\next-task.mjs
  14:14  error  'process' is not defined  no-undef
✖ 47 problems (47 errors, 0 warnings)
```

and the scaffold test caught a gate/script mismatch:

```
FAIL scripts/checks/scaffold.test.mjs > gate wiring > defines every pnpm script that scripts/gate.sh invokes
AssertionError: expected [ 'audit' ] to deeply equal []
```

### Green

`pnpm gate` tail:

```
> lane check
> format      All matched files use Prettier code style!
> lint
> typecheck
> i18n keys   i18n:check skipped (message files not created yet — M3)
> unit tests  Test Files 1 passed (1) / Tests 13 passed (13)
> contracts in sync   pending: contracts:check — not implemented until TMU-OPS-004
> openapi lint        pending: contracts:lint — not implemented until TMU-OPS-004
> migrations check    pending: db:check — not implemented until TMU-OPS-005
OK gate(quick) passed
```

`pnpm gate:full` runs every step up to `secret scan`, which stops at
`gitleaks: command not found` — a host prerequisite tracked by TMU-OPS-008.

### Notes for the reviewer

- Prettier initially reported 45 files, 38 of them hand-authored prose (`.opencode/**`,
  `AGENTS.md`, `README.md`). Reformatting those would be a drive-by change across every open doc
  task, so `.prettierignore` excludes prose and the 7 remaining files were code/config that had
  never been formatted. Those 7 diffs are re-wrapping and indentation only — reviewed hunk by
  hunk, plus a whitespace-stripped token comparison against `HEAD` — with one intentional
  exception: `scripts/backlog-index.mjs` gained a comment in an empty `catch` block to satisfy
  the new `no-empty` lint rule.
- `scripts/gate.sh` now keys the ML step on `services/ml/pyproject.toml` rather than the
  directory, so TMU-OPS-006 can enable it without editing `scripts/`.
- `.agent/lanes.json` gained `pnpm-workspace.yaml`, `.npmrc`, `tsconfig*.json`, `.prettier*`,
  `packages/config/**`, `docs/_source/proposal-extract.md`, and put `backlog.md`/`status.md` in
  `_common` — every task regenerates those two files, so they were previously out-of-lane.
- The `fe` lane also gained the app-level files that FE-01 needs but no lane owned
  (`apps/web/package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`,
  `vitest.config.ts`, `public/**`, `src/app/*.tsx`, `src/app/*.css`, `src/middleware.ts`,
  `src/styles/**`). Without this, TMU-OPS-003 fails `check-lane.sh` on its first commit.
  `apps/web/src/app/api/**` stays with `be`, matching the route-handler ownership split.

- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/1 - OPEN, not draft, mergeable/CLEAN, CI green on `bedf703`
- Review: `docs/08-project/reviews/TMU-OPS-001.md` — APPROVE (8 MINOR, all addressed except F4)

### Review follow-ups

| Finding | Severity | Action |
|---|---|---|
| F1 `meta` lane owns `docs/04-contracts/CHANGELOG.md` | MINOR | Fixed — exception codified in `scaffold.test.mjs`, not hidden |
| F2 M0 id test hard-coded to `TMU-OPS-001..010` | MINOR | Fixed — now asserts unique ids that match filenames |
| F3 `.npmrc` comments described the wrong settings | MINOR | Fixed — comments now match the applied policy |
| F4 no Windows `bash` shim for `pnpm gate` | MINOR | Deferred — documented in the setup doc; carried into TMU-OPS-008 (toolchain prerequisites) |
| F5 `pnpm dev` exits 1 against the "First run" doc | MINOR | Fixed — M0 caveat added to `docs/07-ops/01-local-dev-setup.md` |
| F6 `git diff -w` evidence claim not reproducible | MINOR | Fixed — evidence rephrased and the verification method recorded |
| F7 Node globals applied to all TS/TSX workspace-wide | MINOR | Fixed — Node globals scoped; browser globals added for `apps/web/src/**` |
| F8 `audit` flags duplicated in gate and package.json | MINOR | Fixed — the gate now calls `pnpm -s run audit` once |

## Blockers

(none)
