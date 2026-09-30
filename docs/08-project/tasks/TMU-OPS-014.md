---
id: TMU-OPS-014
title: Workspace glob for test packages
status: TODO
lane: ops
slug: test-workspace-glob
milestone: M0
priority: P2
owner: ops-dev
deps: [TMU-OPS-013]
refs: [WF-CICD, ARCH-STACK]
created: 2026-09-30
updated: 2026-09-30
---

# TMU-OPS-014 — Workspace glob for test packages

## Goal

Add `tests/*` to `pnpm-workspace.yaml` and update the scaffold test's workspace-glob assertion,
so the test packages from TMU-OPS-013 are real workspace members and `pnpm --filter` in the
dispatcher can resolve them.

## Context

- `scripts/checks/step.mjs` resolves `test:*` via `pnpm --filter @temuunair/<...>-tests`.
- `pnpm-workspace.yaml` globs only `apps/*` and `packages/*`;
  `scripts/checks/scaffold.test.mjs` asserts exactly that list.
- Root workspace files are the `ops` lane; this task exists so TMU-OPS-013 stays `qa`-owned.

## Acceptance criteria

- [ ] `pnpm-workspace.yaml` lists `apps/*`, `packages/*` and `tests/*`.
- [ ] `scripts/checks/scaffold.test.mjs` asserts the new glob list.
- [ ] `pnpm install --frozen-lockfile` links the `tests/*` packages (lockfile updated).
- [ ] `pnpm test:integration`, `pnpm test:contract`, `pnpm test:e2e` resolve through the dispatcher
      without a `pnpm --filter` "no project found" error.
- [ ] `pnpm gate` green.

## Files expected to change

- `pnpm-workspace.yaml`
- `scripts/checks/scaffold.test.mjs`
- `pnpm-lock.yaml`

## Out of scope

- The test packages themselves (TMU-OPS-013).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | root-file split for the qa test packages (review MINOR 3) |
| | | | |

### Plan

1. Add the glob; update the test.
2. Reinstall and confirm the links.
3. `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
