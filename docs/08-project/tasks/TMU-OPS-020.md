---
id: TMU-OPS-020
title: Clear the advisory audit red (postcss under next)
status: TODO
lane: ops
slug: audit-postcss-override
milestone: M0
priority: P3
owner: ops-dev
deps: [TMU-OPS-003]
refs: [WF-CICD]
created: 2026-10-01
updated: 2026-10-01
---

# TMU-OPS-020 — Clear the advisory audit red (postcss under `next`)

## Goal

Make the CI `audit` job green now that `apps/web` pulls `next` (and its transitive
`postcss`), instead of failing (advisory) on every PR.

## Context

- The `audit` job in `.github/workflows/ci.yml` is `continue-on-error: true` (advisory at
  first, Blueprint §7.10), so this never blocks a merge — but it reports `fail` on PR #10.
- `pnpm -s run audit` (2026-10-01, on `agent/fe/TMU-OPS-003-web-app-shell`) →
  `6 vulnerabilities found (4 moderate | 2 high)`, all with path `apps__web>next>postcss`
  (e.g. GHSA-r28c-9q8g-f849, fixed in `postcss >=8.5.18`; GHSA-6g55-p6wh-862q, fixed in
  `>=8.5.12`). The direct dependency is Next's, not ours.
- Before TMU-OPS-003 the workspace had no `next`, so audit passed.

## Acceptance criteria

- [ ] `pnpm -s run audit` exits 0 on a branch containing `apps/web` — e.g. via a
      `pnpm.overrides` entry for `postcss` (`>=8.5.18`) in the root `package.json` (ops lane),
      or a `next` bump if a release ships the patched transitive already (choose the least
      invasive that actually clears the advisories).
- [ ] `pnpm --filter @temuunair/web build` still succeeds (Next compiles with the resolved
      postcss).
- [ ] `pnpm gate` green.

## Files expected to change

- root `package.json` (`pnpm.overrides`) and/or `pnpm-lock.yaml`
- possibly `docs/08-project/tasks/TMU-OPS-020.md`

## Out of scope

- Turning `audit` from advisory to required (separate decision).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-01 | orchestrator | task filed | observed on PR #10 CI + local `pnpm run audit` (6 vulns, all `apps__web>next>postcss`) |

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
