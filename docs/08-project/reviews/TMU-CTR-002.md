---
id: REV-TMU-CTR-002
task: TMU-CTR-002
title: "Author contract schemas for reports (API-REP-01..08)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-CTR-002 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/contracts/TMU-CTR-002-contract-reports`.
Files reviewed: `packages/contracts/src/common.ts`, `packages/contracts/src/registry.ts`,
`packages/contracts/src/examples.ts`, `packages/contracts/src/registry.test.ts`,
`docs/04-contracts/backend/BE-02-openapi.yaml`, `packages/contracts/generated/*`, `tasks/TMU-CTR-002.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
All 8 report contract endpoints (`API-REP-01` through `API-REP-08`) have been implemented in
`packages/contracts/src/registry.ts` with typed Zod schemas in `common.ts`. The schemas correctly encode
cross-field rules (custody options for found reports, verification hint inputs, sensitive masking,
and concurrency/state error codes). All contract validation suites (`contracts:build`, `contracts:check`,
`contracts:lint`, `contracts:breaking`) and `pnpm gate:quick` pass cleanly with baseline 1.0.0.

## Contract Specification & Artifact Audit

| Operation | Method & Path | Auth | Request Schema | Response Schema | Status |
|---|---|---|---|---|---|
| `API-REP-01` | `POST /api/v1/reports` | user | `ReportCreate` | `ReportOwnerView` | PASS |
| `API-REP-02` | `GET /api/v1/reports` | user | null | `Paged<ReportPublic>` | PASS |
| `API-REP-03` | `GET /api/v1/reports/mine` | user | null | `Paged<ReportOwnerView>` | PASS |
| `API-REP-04` | `GET /api/v1/reports/{id}` | user | null | `ReportOwnerView` | PASS |
| `API-REP-05` | `PATCH /api/v1/reports/{id}` | owner | `ReportUpdate` | `ReportOwnerView` | PASS |
| `API-REP-06` | `POST /api/v1/reports/{id}/cancel` | owner | `ReportCancelRequest` | `ReportOwnerView` | PASS |
| `API-REP-07` | `POST /api/v1/reports/{id}/renew` | owner | null | `ReportOwnerView` | PASS |
| `API-REP-08` | `POST /api/v1/reports/{id}/flag` | user | `ReportFlagRequest` | `ReportFlagResponse` | PASS |

## Generator & Toolchain Verification

- `BE-02-openapi.yaml` regenerated with 22 operations matching OAS 3.1.0 specifications.
- `packages/contracts/generated/types.ts` contains typed paths, schemas, and operations for report endpoints.
- `packages/contracts/generated/client.ts` and `generated/msw-handlers.ts` regenerated in sync with synthetic report examples.
- `contracts:check`: OK (version 1.0.0).
- `contracts:lint`: OK (0 findings).
- `contracts:breaking`: OK (baseline 1.0.0).
- `pnpm test:unit`: 16/16 test files passed, 140/140 tests green.

## Acceptance Criteria Verification

- [x] **AC 1 (All 8 Report Endpoints Defined):** All 8 report endpoints are defined in the route registry with typed Zod schemas.
- [x] **AC 2 (Cross-Field Rules Encoded):** Cross-field rules (custody, hints, sensitive masking) are reflected in contract types.
- [x] **AC 3 (Toolchain Green):** `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [x] **AC 4 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
