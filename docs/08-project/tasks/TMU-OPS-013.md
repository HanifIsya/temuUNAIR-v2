---
id: TMU-OPS-013
title: Integration, contract and E2E test packages
status: TODO
lane: qa
slug: test-packages
milestone: M0
priority: P2
owner: qa-engineer
deps: [TMU-OPS-003, TMU-OPS-005, TMU-OPS-007]
refs: [WF-CICD, BE-13, FE-12]
created: 2026-09-30
updated: 2026-09-30
---

# TMU-OPS-013 — Integration, contract and E2E test packages

## Goal

Create the three test workspace packages that the dispatcher routes to
(`tests/integration`, `tests/contract`, `tests/e2e`), so `pnpm test:integration`,
`pnpm test:contract` and `pnpm test:e2e` run real suites instead of the named placeholders, and
the CI `integration`/`contract-fuzz`/`e2e` jobs stop being no-ops.

## Context

- `scripts/checks/step.mjs` (TMU-OPS-011) routes `test:integration` → `tests/integration`,
  `test:contract` → `tests/contract`, `test:e2e` → `tests/e2e` via `pnpm --filter`.
- `tests/**` is the `qa` lane (`.agent/lanes.json`); this task is `qa`-owned and `qa-engineer`
  may edit it.
- `pnpm-workspace.yaml` currently globs only `apps/*` and `packages/*`; adding the test packages
  needs the `tests/*` glob — a root file, so request it from the `ops` lane (TMU-OPS-014) or have
  this task's reviewer accept a one-line `ops` hunk. **Planned: TMU-OPS-014 adds the glob and the
  workspace-manifest test update; this task depends on it.**
- E2E uses Playwright with `ML_MODE=stub`; integration uses testcontainers; contract uses
  Schemathesis against the emitted OpenAPI (available after TMU-OPS-004).

## Acceptance criteria

- [ ] `pnpm test:integration` runs Vitest + testcontainers against Postgres/MinIO/Mailpit and
      exits 0 with at least one real test (not a placeholder).
- [ ] `pnpm test:contract` runs Schemathesis against the emitted OpenAPI and exits 0.
- [ ] `pnpm test:e2e` runs a Playwright smoke scenario against the built web app with
      `ML_MODE=stub` and exits 0.
- [ ] Each package has its own `package.json` with the script names the dispatcher expects
      (`test`).
- [ ] The gate's `test:*` steps no longer print the placeholder notice.
- [ ] `docs/06-quality/02-test-cases/TC-ADM.md` TC-I18N-001's automated path is aligned with the
      dispatcher's `tests/contract/` directory (review MINOR; both paths are `qa` lane).
- [ ] `pnpm gate` green.

## Files expected to change

- `tests/integration/**`, `tests/contract/**`, `tests/e2e/**`

## Out of scope

- The full E2E-01..15 scenario suite (M3+; this task ships one smoke scenario each).
- `pnpm-workspace.yaml` / root `package.json` edits (TMU-OPS-014).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | split out of TMU-OPS-008 after review BLOCKER 2 (tests is qa-lane) |
| | | | |

### Plan

1. Add the three packages with the dispatcher's script names.
2. Wire each to its runner (testcontainers, Schemathesis, Playwright).
3. Add one real smoke test per package.
4. `pnpm test:integration|contract|e2e`, then `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
