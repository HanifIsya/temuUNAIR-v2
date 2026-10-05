---
id: REV-TMU-CTR-004
task: TMU-CTR-004
title: "Author contract schemas for claims, chat and handover (API-CLM-01..10, API-CHT-01..04)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-CTR-004 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/contracts/TMU-CTR-004-contract-claims-chat`.
Files reviewed: `packages/contracts/src/common.ts`, `packages/contracts/src/registry.ts`,
`packages/contracts/src/examples.ts`, `packages/contracts/src/registry.test.ts`,
`docs/04-contracts/backend/BE-02-openapi.yaml`, `packages/contracts/generated/*`, `tasks/TMU-CTR-004.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
All 14 target claim, handover, and chat contract endpoints (`API-CLM-01` through `API-CLM-10` and
`API-CHT-01` through `API-CHT-04`) have been implemented in `packages/contracts/src/registry.ts` with
strongly typed Zod schemas in `common.ts`. The claim verification flow correctly exposes only hint
*prompts* (`ChallengeItem`) while expected answers appear only in `ClaimAnswerView.expectedAnswer`
for finder/moderator contexts. Two-sided handover confirmation and claim state transitions
(`ClaimStatus`) are fully encoded. All contract verification checks and `pnpm gate:quick` pass.

## Contract Specification & Artifact Audit

| Operation | Method & Path | Auth | Request Schema | Response Schema | Status |
|---|---|---|---|---|---|
| `API-CLM-01` | `GET /api/v1/reports/{id}/challenge` | user | null | `Challenge` | PASS |
| `API-CLM-02` | `POST /api/v1/claims` | user | `ClaimCreate` | `ClaimView` | PASS |
| `API-CLM-03` | `GET /api/v1/claims` | user | null | `Paged<ClaimView>` | PASS |
| `API-CLM-04` | `GET /api/v1/claims/{id}` | user | null | `ClaimView` | PASS |
| `API-CLM-05` | `POST /api/v1/claims/{id}/approve` | owner | `ClaimDecisionRequest` | `ClaimView` | PASS |
| `API-CLM-06` | `POST /api/v1/claims/{id}/reject` | owner | `ClaimRejectRequest` | `ClaimView` | PASS |
| `API-CLM-07` | `PUT /api/v1/claims/{id}/handover-plan` | user | `HandoverPlanRequest` | `ClaimView` | PASS |
| `API-CLM-08` | `POST /api/v1/claims/{id}/confirm-handover` | user | null | `ClaimView` | PASS |
| `API-CLM-09` | `POST /api/v1/claims/{id}/cancel` | user | `ClaimCancelRequest` | `ClaimView` | PASS |
| `API-CLM-10` | `POST /api/v1/claims/{id}/dispute` | user | `ClaimDisputeRequest` | `ClaimView` | PASS |
| `API-CHT-01` | `GET /api/v1/claims/{id}/messages` | user | null | `Paged<ChatMessage>` | PASS |
| `API-CHT-02` | `POST /api/v1/claims/{id}/messages` | user | `ChatMessageCreate` | `ChatMessage` | PASS |
| `API-CHT-03` | `GET /api/v1/claims/{id}/stream` | user | null | `ChatStreamEvent` (SSE) | PASS |
| `API-CHT-04` | `POST /api/v1/claims/{id}/messages/read` | user | `ChatReadReceiptRequest` | `ActionStatusResponse` | PASS |

## Generator & Toolchain Verification

- `BE-02-openapi.yaml` regenerated with all claim and chat operations matching OAS 3.1.0 specifications.
- `packages/contracts/generated/types.ts` contains typed paths, schemas, and operations for claim/chat endpoints.
- `packages/contracts/generated/client.ts` and `generated/msw-handlers.ts` regenerated in sync with synthetic examples.
- `contracts:check`: OK (version 1.0.0).
- `contracts:lint`: OK (0 findings; SSE `event` is a plain string since protocol event names are lowercase).
- `contracts:breaking`: OK (baseline 1.0.0).

## Acceptance Criteria Verification

- [x] **AC 1 (Prompt Masking & Two-Sided Confirmation):** All claim, handover, and chat endpoints defined with prompt masking and two-sided confirmation states.
- [x] **AC 2 (Toolchain Green):** `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green (140/140 unit tests).