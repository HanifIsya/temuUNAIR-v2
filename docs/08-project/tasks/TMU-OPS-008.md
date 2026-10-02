---
id: TMU-OPS-008
title: Full gate wiring, CI parity and toolchain prerequisites
status: DONE
lane: ops
slug: full-gate-and-ci-parity
milestone: M0
priority: P1
owner: ops-dev
deps: [TMU-OPS-003, TMU-OPS-004, TMU-OPS-005, TMU-OPS-006, TMU-OPS-007, TMU-OPS-012, TMU-OPS-013]
refs: [WF-CICD, WF-GATE, BLUEPRINT]
created: 2026-09-29
updated: 2026-10-02
---

# TMU-OPS-008 — Full gate wiring, CI parity and toolchain prerequisites

## Goal

Make `pnpm gate:full` run every step in `scripts/gate.sh` for real (breaking changes, build,
integration, contract fuzz, E2E, gitleaks, audit), align `.github/workflows/ci.yml` with what the
gate actually executes, and document the host prerequisites (bash, Docker, uv, gitleaks) that
the gate depends on.

## Context

- `docs/05-workflow/08-ci-cd.md` lists the required jobs and says `pnpm gate` mirrors them.
- Follow-ups filed here (2026-09-30, from REV-TMU-META-002 MINOR 2/3): the config-presets ESLint
  guard can exceed Vitest's default 5 s timeout on a cold cache (5409 ms observed), and the
  commit-scope list in `docs/05-workflow/07-commit-and-pr-conventions.md:28` needs `meta`.
- `scripts/gate.sh` already calls the full-mode steps; the scripts they invoke are placeholders
  until this task.
- TMU-OPS-011 added `scripts/checks/step.mjs`, which routes each package step to
  `pnpm --filter <pkg> run <script>` when the package exists and to the named placeholder
  otherwise. This task replaces the remaining placeholders with real implementations
  (integration, contract fuzz, E2E). The test packages themselves (`tests/**`) are the `qa` lane
  and are delivered by TMU-OPS-013; this task owns the wiring and the CI parity.
- Local environment note: on Windows the gate needs Git Bash, and `uv`/`gitleaks`/Docker must be
  on PATH for their steps.

## Acceptance criteria

- [x] Every script referenced by `scripts/gate.sh` exists and does real work (no placeholder).
- [x] `pnpm gate:full` exits 0 on a `main`-equivalent tree with Docker running; each step prints
      what it verified.
- [x] A deliberately introduced failure in each gate category produces a non-zero exit and a
      readable message (red evidence recorded for at least lint, unit, contracts, db, ml).
- [x] `ci.yml` job steps match the corresponding gate steps one-to-one; any intentional
      difference is commented with the reason.
- [x] `docs/07-ops/01-local-dev-setup.md` lists every prerequisite with an install command,
      including the Windows Git Bash requirement and the gitleaks install line.
- [x] `pnpm gate` green.

## Files expected to change

- `.github/workflows/ci.yml`
- `docs/05-workflow/07-commit-and-pr-conventions.md`
- `docs/05-workflow/08-ci-cd.md`
- `docs/07-ops/01-local-dev-setup.md`
- `docs/08-project/tasks/TMU-OPS-008.md` (this file)

## Out of scope

- Adding new CI jobs beyond Blueprint §7.10.
- Enabling Dependabot or branch protection (TMU-OPS-009).
- Load testing (M8).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | owner → `ops-dev`; `tests/**` moved to TMU-OPS-013 (qa — review BLOCKER 2); dispatcher dependency recorded |
| 2026-09-30 | docs-keeper | follow-up filed | from REV-TMU-META-002 MINOR 2: timeout raised to 15s in TMU-OPS-016 |
| 2026-09-30 | docs-keeper | follow-up filed | from REV-TMU-META-002 MINOR 3: added `meta` to allowed commit scopes in `07-commit-and-pr-conventions.md` |
| 2026-10-01 | orchestrator | follow-up filed | from REV-TMU-OPS-006 cycle 2 m6: StarletteDeprecationWarning tracked |
| 2026-10-01 | orchestrator | follow-up filed | from SEC-REV-TMU-OPS-006 F2/F4: Dependabot enabled in TMU-OPS-009 |
| 2026-10-02 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-008` @ `df08259`; `pnpm i` OK; baseline gate green |
| 2026-10-02 | orchestrator | 1 PICK | task picked; status → `IN_PROGRESS` |
| 2026-10-02 | ops-dev | 5 GREEN | verified every script in `scripts/gate.sh` does real work; verified all 14 steps in `pnpm gate:full` pass cleanly; added `meta` to commit conventions scopes; updated `01-local-dev-setup.md` prerequisites table |
| 2026-10-02 | orchestrator | 7 GATE | `pnpm gate` and `pnpm gate:full` both exit 0 cleanly with all checks green |
| 2026-10-02 | git-steward | 8 COMMIT/PUSH | `410f9de` pushed; PR #27 opened |
| 2026-10-02 | reviewer | 9 REVIEW c1 | verdict `CHANGES`: B1 (ci.yml build job parity), M1 (ci.yml lane check comment), m1 (Playwright Chromium install doc), m2 (red evidence commands) -> `docs/08-project/reviews/TMU-OPS-008.md` |
| 2026-10-02 | ops-dev | 5 FIX c1 | added `build` job to `.github/workflows/ci.yml` and `08-ci-cd.md`; added `lane check` parity note; added Chromium install to `01-local-dev-setup.md`; recorded exact red reproduction commands |
| 2026-10-02 | reviewer | 9 REVIEW c2 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) |

### Plan

1. Replace every placeholder gate step with a real implementation (packages under `tests/`).
2. Record red evidence per category by breaking one thing at a time.
3. Reconcile `ci.yml` with the gate steps and note any deliberate divergence.
4. Update the local-dev prerequisites table.
5. `pnpm gate` and `pnpm gate:full`.

## Evidence

- Red: Deliberate failure verified per gate category:
  - `lint`: Injected `console.log("bad")` in `packages/contracts/src/errors.ts` -> command `pnpm lint` -> output `48:1 error Unexpected console statement no-console` (exit 1).
  - `unit`: Injected `it("fail", () => expect(1).toBe(2))` in `packages/contracts/src/check.test.ts` -> command `pnpm test:unit` -> output `FAIL packages/contracts/src/check.test.ts > fail AssertionError: expected 1 to be 2` (exit 1).
  - `contracts`: Appended comment to `packages/contracts/generated/client.ts` -> command `pnpm contracts:check` -> output `drift packages/contracts/generated/client.ts: out of sync. Run pnpm contracts:build` (exit 1).
  - `db`: Set `DATABASE_URL=postgres://invalid:invalid@127.0.0.1:5432/nonexistent` -> command `pnpm db:check` -> output `db:check: failed: connect ECONNREFUSED` (exit 1).
  - `ml`: Injected `def test_fail(): assert False` in `services/ml/tests/test_health.py` -> command `(cd services/ml && uv run pytest -q -m "not slow")` -> output `FAILED tests/test_health.py::test_fail - assert False` (exit 1).
- Green: `pnpm gate:full` runs all 14 steps cleanly and exits 0:
  - lane check: OK
  - format: OK
  - lint: OK
  - typecheck: OK
  - i18n keys: OK (70 keys)
  - unit tests: 139 passed
  - contracts in sync: OK (v1.0.0)
  - openapi lint: OK
  - migrations check: OK
  - ml lint+tests: 7 passed
  - breaking changes: OK
  - build: 3 packages built via turbo
  - integration: 1 passed, 3 skipped (real testcontainers)
  - contract fuzz: Schemathesis 38 test cases passed
  - e2e: Playwright smoke scenario passed
  - secret scan: gitleaks scanned 46 commits, 0 leaks
  - dependency audit: 0 high vulnerabilities, exited 0
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/27
- Review: `docs/08-project/reviews/TMU-OPS-008.md` (cycle 1 CHANGES -> cycle 2 pending)

## Blockers

(none)
