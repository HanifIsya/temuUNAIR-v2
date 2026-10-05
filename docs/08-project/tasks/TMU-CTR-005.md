---
id: TMU-CTR-005
title: Author contract schemas for notifications and admin operations (API-NTF-01..04, API-ADM-01..17)
status: DONE
lane: contracts
slug: contract-notif-admin
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-CTR-004, TMU-ARC-010]
refs: [BE-03, BE-04, BE-08, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-005 — Author contract schemas for notifications and admin operations (API-NTF-01..04, API-ADM-01..17)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-NTF-01..04` and
`API-ADM-01..17` per `BE-03`, `BE-08`, and admin RBAC specifications.

## Acceptance criteria

- [x] All notification endpoints and 17 admin endpoints defined with strict role authorization tags.
- [x] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `packages/contracts/src/common.ts`
- `packages/contracts/src/enums.ts`
- `packages/contracts/src/registry.ts`
- `packages/contracts/src/examples.ts`
- `packages/contracts/src/registry.test.ts`
- `docs/04-contracts/backend/BE-02-openapi.yaml`
- `packages/contracts/generated/*`
- `docs/08-project/tasks/TMU-CTR-005.md`
- `docs/08-project/reviews/TMU-CTR-005.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | architect | 1 PICK | branch `agent/contracts/TMU-CTR-005-contract-notif-admin` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020, TMU-CTR-004, TMU-ARC-010` DONE |
| 2026-10-03 | architect | 3 PLAN | 1) Define Notification schemas (Notification, UnreadCount) and Admin schemas (AdminUser, AdminStats, AuditLog, Flag, LocationUpsert, DropPointUpsert, resolve requests) in common.ts; 2) Add API-NTF-01..04 and API-ADM-01..17 to registry.ts; 3) Add synthetic examples to examples.ts; 4) Update registry.test.ts; 5) Run contracts:build, check, lint, breaking; 6) Run pnpm gate:quick; 7) Write review; 8) Ship |
| 2026-10-03 | architect | 5 GREEN | Added NotificationType/FlagStatus/DisputeDecision/LocationKind enums and 14 new schemas; registered 4 NTF + 17 ADM routes with moderator/admin/user auth tags per BE-03/BE-08; synthetic examples added; registry.test.ts updated to 62 routes |
| 2026-10-03 | architect | 7 GATE | `pnpm contracts:check` OK (1.0.0), `contracts:lint` OK, `contracts:breaking` OK (additive), `pnpm gate:quick` → `OK gate(quick) passed` (140/140 unit) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 1 MINOR) → `docs/08-project/reviews/TMU-CTR-005.md`; N1 recorded (see follow-up note) |
| 2026-10-03 | architect | fix c1 | (N1) Follow-up filed as `TMU-CTR-008` (P3, deps TMU-CTR-005): split BE-03 combined `API-ADM-12/13` GET/POST/PATCH rows into per-method API IDs with a BE-03 amendment + CHANGELOG version bump, before any M3 admin-places UI consumes them; registry currently registers only the collection-POST upsert per ID because one operationId allows one method |
| 2026-10-03 | architect | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — contract schema authoring task (generated artifact drift is covered by `contracts:check`)
- Green: `contracts:build` regenerated 4 artefacts (62 operations); `contracts:check` OK; `contracts:lint` OK; `contracts:breaking` OK (baseline 1.0.0); `pnpm gate:quick` passed (140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 1 MINOR N1 accepted + filed to TMU-CTR-007) → `docs/08-project/reviews/TMU-CTR-005.md`

## Blockers

(none)
