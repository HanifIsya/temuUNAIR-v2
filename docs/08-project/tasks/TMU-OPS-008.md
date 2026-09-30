---
id: TMU-OPS-008
title: Full gate wiring, CI parity and toolchain prerequisites
status: TODO
lane: ops
slug: full-gate-and-ci-parity
milestone: M0
priority: P1
owner: ops-dev
deps: [TMU-OPS-003, TMU-OPS-004, TMU-OPS-005, TMU-OPS-006, TMU-OPS-007]
refs: [WF-CICD, WF-GATE, BLUEPRINT]
created: 2026-09-29
updated: 2026-09-30
---

# TMU-OPS-008 — Full gate wiring, CI parity and toolchain prerequisites

## Goal

Make `pnpm gate:full` run every step in `scripts/gate.sh` for real (breaking changes, build,
integration, contract fuzz, E2E, gitleaks, audit), align `.github/workflows/ci.yml` with what the
gate actually executes, and document the host prerequisites (bash, Docker, uv, gitleaks) that
the gate depends on.

## Context

- `docs/05-workflow/08-ci-cd.md` lists the required jobs and says `pnpm gate` mirrors them.
- `scripts/gate.sh` already calls the full-mode steps; the scripts they invoke are placeholders
  until this task.
- TMU-OPS-011 added `scripts/checks/step.mjs`, which routes each package step to
  `pnpm --filter <pkg> run <script>` when the package exists and to the named placeholder
  otherwise. This task replaces the remaining placeholders with real implementations
  (integration, contract fuzz, E2E) and adds the missing test packages.
- Local environment note: on Windows the gate needs Git Bash, and `uv`/`gitleaks`/Docker must be
  on PATH for their steps.

## Acceptance criteria

- [ ] Every script referenced by `scripts/gate.sh` exists and does real work (no placeholder).
- [ ] `pnpm gate:full` exits 0 on a `main`-equivalent tree with Docker running; each step prints
      what it verified.
- [ ] A deliberately introduced failure in each gate category produces a non-zero exit and a
      readable message (red evidence recorded for at least lint, unit, contracts, db, ml).
- [ ] `ci.yml` job steps match the corresponding gate steps one-to-one; any intentional
      difference is commented with the reason.
- [ ] `docs/07-ops/01-local-dev-setup.md` lists every prerequisite with an install command,
      including the Windows Git Bash requirement and the gitleaks install line.
- [ ] `pnpm gate` green.

## Files expected to change

- `scripts/**`
- `.github/workflows/ci.yml`
- root `package.json`
- `tests/integration/**`, `tests/contract/**`, `tests/e2e/**` (new test packages)
- `docs/07-ops/01-local-dev-setup.md`
- `docs/05-workflow/08-ci-cd.md` (only if the parity table changes)

## Out of scope

- Adding new CI jobs beyond Blueprint §7.10.
- Enabling Dependabot or branch protection (TMU-OPS-009).
- Load testing (M8).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | owner → `ops-dev`; dispatcher dependency recorded; docs-lane files noted |

### Plan

1. Replace every placeholder gate step with a real implementation (packages under `tests/`).
2. Record red evidence per category by breaking one thing at a time.
3. Reconcile `ci.yml` with the gate steps and note any deliberate divergence.
4. Update the local-dev prerequisites table.
5. `pnpm gate` and `pnpm gate:full`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)