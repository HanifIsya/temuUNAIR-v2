---
id: REV-TMU-CTR-001
task: TMU-CTR-001
title: "Author contract schemas for ME, preferences and uploads (API-ME-*, API-UPL-*, API-META-02/04)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-CTR-001 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/contracts/TMU-CTR-001-contract-me-uploads`.
Files reviewed: `packages/contracts/src/common.ts`, `packages/contracts/src/enums.ts`,
`packages/contracts/src/registry.ts`, `packages/contracts/src/examples.ts`,
`packages/contracts/src/generate.ts`, `packages/contracts/src/generate.test.ts`,
`packages/contracts/src/registry.test.ts`, `docs/04-contracts/backend/BE-02-openapi.yaml`,
`packages/contracts/generated/*`, `tasks/TMU-CTR-001.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
All 10 target contract endpoints (`API-META-02`, `API-META-04`, `API-ME-01..05`, and `API-UPL-01..03`)
have been implemented in `packages/contracts/src/registry.ts` with strongly typed Zod schemas in
`common.ts` and `enums.ts`. `packages/contracts/src/generate.ts` was enhanced to support `requestBody`
generation for operations with input payloads and path parameters for parameterized paths (`/uploads/{id}`).
All contract validation suites (`contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking`)
pass cleanly with baseline 1.0.0, and `pnpm gate:quick` exits 0 with 140/140 unit tests green.

## Contract Specification & Artifact Audit

| Operation | Method & Path | Auth | Request Schema | Response Schema | Status |
|---|---|---|---|---|---|
| `API-META-02` | `GET /api/v1/meta/campuses` | user | null | `z.array(CampusMeta)` | PASS |
| `API-META-04` | `GET /api/v1/meta/drop-points` | user | null | `z.array(DropPointMeta)` | PASS |
| `API-ME-01` | `GET /api/v1/me` | user | null | `Me` | PASS |
| `API-ME-02` | `PATCH /api/v1/me` | user | `MeUpdate` | `Me` | PASS |
| `API-ME-03` | `DELETE /api/v1/me` | user | null | `AccountDeletionResponse` | PASS |
| `API-ME-04` | `GET /api/v1/me/notification-preferences` | user | null | `NotificationPrefs` | PASS |
| `API-ME-05` | `PUT /api/v1/me/notification-preferences` | user | `NotificationPrefs` | `NotificationPrefs` | PASS |
| `API-UPL-01` | `POST /api/v1/uploads` | user | `UploadInitRequest` | `UploadInitResponse` | PASS |
| `API-UPL-02` | `POST /api/v1/uploads/{id}/complete` | owner | null | `UploadState` | PASS |
| `API-UPL-03` | `GET /api/v1/uploads/{id}` | owner | null | `UploadState` | PASS |

## Generator & Toolchain Verification

- `BE-02-openapi.yaml` regenerated with 14 paths and 14 operations matching OAS 3.1.0 specifications.
- `packages/contracts/generated/types.ts` contains typed paths, schemas, and operations with requestBody definitions.
- `packages/contracts/generated/client.ts` and `generated/msw-handlers.ts` regenerated in sync with synthetic examples.
- `contracts:check`: OK (version 1.0.0).
- `contracts:lint`: OK (0 findings; camelCase, SCREAMING_SNAKE enums, X-Request-Id headers).
- `contracts:breaking`: OK (additive non-breaking change against baseline 1.0.0).
- `pnpm test:unit`: 16/16 test files passed, 140/140 tests green.

## Acceptance Criteria Verification

- [x] **AC 1 (Endpoints Defined):** All ME, UPL, and remaining META endpoints are defined in the route registry with typed Zod schemas.
- [x] **AC 2 (Toolchain Green):** `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
