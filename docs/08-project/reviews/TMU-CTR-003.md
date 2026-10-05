---
id: REV-TMU-CTR-003
task: TMU-CTR-003
title: "Author contract schemas for search and matching (API-SRC-01, API-MAT-01..04)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-CTR-003 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/contracts/TMU-CTR-003-contract-search-matching`.
Files reviewed: `packages/contracts/src/common.ts`, `packages/contracts/src/enums.ts`,
`packages/contracts/src/registry.ts`, `packages/contracts/src/examples.ts`,
`packages/contracts/src/registry.test.ts`, `docs/04-contracts/backend/BE-02-openapi.yaml`,
`packages/contracts/generated/*`, `tasks/TMU-CTR-003.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
All 5 target search and matching contract endpoints (`API-SRC-01` and `API-MAT-01..04`) have been
implemented in `packages/contracts/src/registry.ts` with strongly typed Zod schemas in `common.ts` and
`enums.ts` (`MatchState`, `SearchRequest`, `SearchHit`, `MatchView`, `RematchResponse`, `ActionStatusResponse`).
As mandated by Blueprint §5A.9 and DEC-012, numeric scores are omitted from user-facing match payloads
and explainable reason arrays (`MatchReason[]`) are provided. All contract verification checks
(`contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking`) and `pnpm gate:quick`
pass cleanly with baseline 1.0.0.

## Contract Specification & Artifact Audit

| Operation | Method & Path | Auth | Request Schema | Response Schema | Status |
|---|---|---|---|---|---|
| `API-SRC-01` | `POST /api/v1/search` | user | `SearchRequest` | `Paged<SearchHit>` | PASS |
| `API-MAT-01` | `GET /api/v1/reports/{id}/matches` | owner | null | `z.array(MatchView)` | PASS |
| `API-MAT-02` | `POST /api/v1/matches/{id}/dismiss` | user | null | `MatchView` | PASS |
| `API-MAT-03` | `POST /api/v1/matches/{id}/invite` | user | null | `ActionStatusResponse` | PASS |
| `API-MAT-04` | `POST /api/v1/reports/{id}/rematch` | owner | null | `RematchResponse` | PASS |

## Generator & Toolchain Verification

- `BE-02-openapi.yaml` regenerated with 27 operations matching OAS 3.1.0 specifications.
- `packages/contracts/generated/types.ts` contains typed paths, schemas, and operations for search and matching endpoints.
- `packages/contracts/generated/client.ts` and `generated/msw-handlers.ts` regenerated in sync with synthetic match examples.
- `contracts:check`: OK (version 1.0.0).
- `contracts:lint`: OK (0 findings).
- `contracts:breaking`: OK (baseline 1.0.0).
- `pnpm test:unit`: 16/16 test files passed, 140/140 tests green.

## Acceptance Criteria Verification

- [x] **AC 1 (Endpoints & No Score Leakage):** Search and match endpoints defined with bands, reasons, and no raw score leakage.
- [x] **AC 2 (Toolchain Green):** `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
