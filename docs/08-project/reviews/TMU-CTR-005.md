---
id: REV-TMU-CTR-005
task: TMU-CTR-005
title: "Author contract schemas for notifications and admin operations (API-NTF-01..04, API-ADM-01..17)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-CTR-005 — Review cycle 1

Diff reviewed: `main...HEAD` on branch `agent/contracts/TMU-CTR-005-contract-notif-admin`.
Files reviewed: `packages/contracts/src/common.ts`, `packages/contracts/src/enums.ts`,
`packages/contracts/src/registry.ts`, `packages/contracts/src/examples.ts`,
`packages/contracts/src/registry.test.ts`, `docs/04-contracts/backend/BE-02-openapi.yaml`,
`packages/contracts/generated/*`, `tasks/TMU-CTR-005.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 1 MINOR (N1, filed as `TMU-CTR-008`).
All 21 target endpoints (`API-NTF-01..04` and `API-ADM-01..17`) are now defined in
`packages/contracts/src/registry.ts` with strictly typed Zod schemas, matching the
`BE-03` catalog, `BE-08` notification types, and the admin RBAC matrix
(`moderator` for campus-scoped queues, `admin` for users/places/reindex/audit).
The full 62-operation contract is generated, linted, and drift-checked against the
1.0.0 baseline with `contracts:breaking` reporting no breaking changes. `pnpm gate:quick`
passes with 140/140 unit tests.

## Contract Specification & Artifact Audit

| Group | IDs | Auth tags verified | Status |
|---|---|---|---|
| Notifications | `API-NTF-01..04` | user/owner feed, mark-read, mark-all, unread count | PASS |
| Reports moderation | `API-ADM-01..04` | moderator approve/remove, admin restore | PASS |
| Claims moderation | `API-ADM-05..06` | moderator queue + dispute resolve (`APPROVE`/`REJECT` enum) | PASS |
| Users | `API-ADM-07..10` | admin list/suspend/unsuspend/role-change (`FORBIDDEN` on self-demote documented) | PASS |
| Stats | `API-ADM-11` | moderator; matches BE-03 `AdminStats` example verbatim | PASS |
| Places | `API-ADM-12..13` | admin upsert (see note) | PASS |
| Audit & reindex | `API-ADM-14..15` | admin read-only audit, reindex enqueue | PASS |
| Flags | `API-ADM-16..17` | moderator list + resolve | PASS |

Notification type enum mirrors the canonical 15 `NotificationType` values of `BE-08`; no type outside `BE-08` is invented.

## MINOR findings

| ID | Finding | Disposition |
|---|---|---|
| N1 | `BE-03` rows `API-ADM-12`/`API-ADM-13` bundle `GET/POST/PATCH /admin/locations[/{id}]` and `…/drop-points[/{id}]` under one ID each, but the registry enforces one method per unique `API-<AREA>-<NN>` operationId. | Registered each as the collection-`POST` upsert route with the `LocationUpsert`/`DropPointUpsert` schemas (the writable core). The GET-list and PATCH-variant surfaces are service-layer reads/updates of the same resources. **Filed**: split into new IDs via a `BE-03` amendment in follow-up task **`TMU-CTR-008`** (deps `TMU-CTR-005`, P3, M2). |

## Generator & Toolchain Verification

- `BE-02-openapi.yaml` regenerated: 62 operations total, all paths under `/api/v1` except system probes.
- `generated/types.ts`, `client.ts`, `msw-handlers.ts` regenerated; every route has a synthetic example (no PII, all `example.test`/fictional data).
- `contracts:check` OK (version 1.0.0), `contracts:lint` OK (0 findings), `contracts:breaking` OK (baseline 1.0.0 — additive only).
- `pnpm gate:quick` → `OK gate(quick) passed` (lane check, 140/140 unit, db, ml).

## Acceptance Criteria Verification

- [x] **AC 1 (All endpoints defined with role tags):** 4 notification + 17 admin endpoints registered; moderation routes tagged `moderator`, privileged routes `admin` per `BE-09`/`FR-ADM-007`.
- [x] **AC 2 (Toolchain green):** `contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking` all green.
- [x] **AC 3 (Gate):** `pnpm gate:quick` exits 0.