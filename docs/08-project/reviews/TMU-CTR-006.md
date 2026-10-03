---
id: REV-TMU-CTR-006
task: TMU-CTR-006
title: "Reconcile BE-05 'Additions required by the docs' with the extensions-only 0001_init"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-CTR-006 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/contracts/TMU-CTR-006-be05-additions-vs-init-migration`.
Files reviewed: `docs/04-contracts/backend/BE-05-database-contract.md`, `docs/04-contracts/CHANGELOG.md`, `tasks/TMU-CTR-006.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
The contradiction between `BE-05-database-contract.md` and the initial migration `0001_init.sql`
has been cleanly resolved per Option (a). `BE-05` no longer instructs the reader to add table/column/index
DDL to `0001_init.sql`; instead, it clarifies that `0001_init.sql` is strictly extensions-only
(`vector`, `citext`), and maps the auxiliary DDL additions (`needs_reprocess` column, full-text
search trigger, and retention indexes) to their respective domain migration tasks in M3 (`TMU-DB-003..005`).
All contract verification checks (`contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking`)
and `pnpm gate:quick` pass cleanly with zero drift and zero breaking changes.

## Acceptance Criteria Verification

| Criterion | Target | Verification Evidence | Status |
|---|---|---|---|
| AC 1: No DDL into `0001_init` | `0001_init` kept extensions-only | Section 126 retitled and rewritten to state `0001_init.sql` is strictly extensions-only; table/index additions moved to domain migrations. | PASS |
| AC 2: Homes & owning `TMU-DB-*` named | `needs_reprocess` & indexes mapped | `needs_reprocess` & FTS trigger assigned to `TMU-DB-003`; claims & chat indexes assigned to `TMU-DB-004`; notifications, audit, and flags indexes assigned to `TMU-DB-005`. | PASS |
| AC 3: Contract version & changelog | `CONTRACT_VERSION` & changelog updated | `docs/04-contracts/CHANGELOG.md` updated under `[Unreleased]` with entry explaining the resolution; `CONTRACT_VERSION` unchanged at `1.0.0` as no HTTP API schema was altered. | PASS |
| AC 4: Contracts toolchain green | build, check, lint, breaking | `contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking` all exit 0 with baseline 1.0.0. | PASS |
| AC 5: No migration files edited | `packages/db/migrations/*` untouched | Verified via `git diff`: 0 migration files touched. | PASS |

## Checks Run

- `bash scripts/check-lane.sh`: exit 0 (lane `contracts` touches only `docs/04-contracts/**` and `_common`).
- `pnpm contracts:check`: OK (version 1.0.0).
- `pnpm contracts:lint`: OK.
- `pnpm contracts:breaking`: OK (baseline 1.0.0).
- `pnpm gate:quick`: OK gate(quick) passed (140/140 unit tests, prettier, eslint, tsc, db, ml).
