---
id: REV-TMU-CTR-008
task: TMU-CTR-008
title: "Split BE-03 admin locations/drop-points combined rows into per-method API IDs"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-CTR-008 — Review cycle 1

Diff reviewed: `main...HEAD` on branch `agent/contracts/TMU-CTR-008-split-admin-places-verbs`.
Files reviewed: `docs/04-contracts/backend/BE-03-endpoint-catalog.md`,
`docs/04-contracts/CONTRACT_VERSION`, `docs/04-contracts/CHANGELOG.md`,
`packages/contracts/src/registry.ts`, `packages/contracts/src/examples.ts`,
`packages/contracts/src/registry.test.ts`, `packages/contracts/src/contract-lint.test.ts`,
`docs/04-contracts/backend/BE-02-openapi.yaml` (generated), `packages/contracts/generated/*`,
`tasks/TMU-CTR-008.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
The `API-ADM-12`/`API-ADM-13` combined rows from `BE-03` are split additively: the existing
create IDs keep their merged-operationId stability (`contracts:breaking` OK against the 1.0.0
baseline), and four new operations (`API-ADM-18..21`) provide the locations list/update and
drop-points list/update surfaces typed against the existing `LocationMeta`/`DropPointMeta`/
`LocationUpsert`/`DropPointUpsert` schemas. `CONTRACT_VERSION` 1.0.0 → 1.1.0 is the governance-
mandated minor bump (additive endpoints) and the `CHANGELOG.md` carries the full
`TMU-CTR-001..005,008` record.

This closes `REV-TMU-CTR-005` MINOR N1 — no silent drop, per the review-cycle rule.

## Findings

### Fix-loop audit (step 7 red → root-cause fix)

The first `gate:full` run failed with `contract-version` (`info.version 1.0.0 must match
CONTRACT_VERSION 1.1.0`) inside `contract-lint.test.ts`. Diagnosis: the test fixture hard-pinned
`VERSION = "1.0.0"` instead of tracking the version file. Fix: the fixture now reads
`docs/04-contracts/CONTRACT_VERSION` at import time. The linter rule itself was **not** weakened,
no test was skipped, and no assertion relaxed — the fixture was the defect. Re-run: all green.

### Contract artifact verification

| Check | Result |
|---|---|
| `contracts:build` | 66 operations regenerated (was 62; +4 additive) |
| `contracts:check` | OK (version 1.1.0) — generated files in sync |
| `contracts:lint` | OK, 0 findings (incl. contract-version now 1.1.0) |
| `contracts:breaking` | OK vs baseline 1.0.0 — additive only, no removals/renames |
| `registry.test.ts` | route set updated: 66 IDs exact-match BE-03 incl. ADM-18..21 |
| `pnpm gate:full` | green: 140/140 unit, db live, ml 7, build, integration, Schemathesis 66/66 ops / 866 cases, e2e, gitleaks, audit (3 moderate, pre-existing) |
| Lane | `bash scripts/check-lane.sh` passes (contracts + `_common` only) |

### BE-03 consistency

- `API-ADM-12` now reads `POST /admin/locations` → `LocationMeta`, `API-ADM-13` = `POST /admin/drop-points` → `DropPointMeta` (previously implied; catalog rows made explicit).
- New rows carry auth `A`, correct notable errors (`VALIDATION_FAILED` for upserts, `—` for list reads — 403 handled by `security-scheme`).
- HTML-comment amendment note documents the split rationale and points at this task.

## Acceptance Criteria Verification

- [x] **AC 1 (BE-03 split + distinct IDs):** `API-ADM-18..21` added; 12/13 restated as create-only; amendment note present.
- [x] **AC 2 (Routes registered):** 4 routes with typed schemas + synthetic examples; registry.test updated.
- [x] **AC 3 (CHANGELOG + version):** minor bump 1.1.0 recorded with reason and additive scope.
- [x] **AC 4 (Contract toolchain):** build/check/lint/breaking all green.
- [x] **AC 5 (Gate):** `gate:full` green (run because the version bump touches the generated suite).

## Verdict

**APPROVE.** Safe to squash-merge; closes TMU-CTR-005 N1. Follow-on note for M3:
`tests/contract/run-contract.mjs` mock still serves only the four M0 GET routes — the
`TMU-BE-*` handler tests must extend it (already handed off in `TMU-CTR-007`'s progress log).
