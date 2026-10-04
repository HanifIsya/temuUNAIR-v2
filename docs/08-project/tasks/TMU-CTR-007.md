---
id: TMU-CTR-007
title: M2 exit checklist, contracts/architecture approval evidence and M3 handoff
status: DONE
lane: contracts
slug: m2-exit-checklist
milestone: M2
priority: P1
owner: orchestrator
deps: [TMU-ARC-001, TMU-ARC-002, TMU-ARC-003, TMU-ARC-004, TMU-ARC-005, TMU-ARC-006, TMU-ARC-007, TMU-ARC-008, TMU-ARC-009, TMU-ARC-010, TMU-ARC-011, TMU-ARC-012, TMU-ARC-013, TMU-ARC-014, TMU-ARC-015, TMU-CTR-001, TMU-CTR-002, TMU-CTR-003, TMU-CTR-004, TMU-CTR-005, TMU-CTR-006]
refs: [ROADMAP, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-007 — M2 exit checklist, contracts/architecture approval evidence and M3 handoff

## Goal

Verify that all Milestone M2 exit criteria from `docs/01-product/10-roadmap.md` are met:
all architecture docs approved, full route catalog implemented and tested, client and MSW generated,
`contracts:check` and full gate green, and hand off M3 (Walking skeleton).

## Acceptance criteria

- [x] All 15 architecture docs are approved (`docs/03-architecture/**`).
- [x] All contract routes from BE-03 are implemented in `packages/contracts/src/registry.ts`.
- [x] `pnpm gate:full` runs green.
- [x] `status.md` shows M2 at 100%.
- [x] M3 handoff documented.

## M2 Exit Criteria Verification Table

| # | Criterion | Evidence | Status |
|---|---|---|---|
| 1 | All architecture docs approved | 19/19 numbered docs + ADR index carry `status: approved` (TMU-ARC-001..015 reviews, all cycle-1 APPROVE). ADR-0004 and ADR-0006 keep lifecycle status `proposed` pending the provisional DECs they record (DEC-003 multilingual encoder verification, DEC-001 real UNAIR domains — deferred to M3 by DEC-021); this is correct ADR lifecycle, not an open doc-review gap. | ☑ PASS |
| 2 | Full BE-03 route catalog implemented | Automated cross-check: 62/62 `API-*` IDs in `BE-03` == 62/62 in `packages/contracts/src/registry.ts` (zero missing, zero extra); all have typed Zod request/response schemas and synthetic examples. | ☑ PASS |
| 3 | OpenAPI + client + MSW generated | `contracts:build` regenerates `BE-02-openapi.yaml` (62 operations), `generated/types.ts`, `generated/client.ts`, `generated/msw-handlers.ts`; `contracts:check` OK (no drift, version 1.0.0). | ☑ PASS |
| 4 | `contracts:lint` / `contracts:breaking` green | lint OK (0 findings); breaking OK vs baseline 1.0.0 (additive endpoints only — minor-eligible, version held at 1.0.0 until `contract-v1.0.0` tag since no released baseline exists yet). | ☑ PASS |
| 5 | `pnpm gate:full` green | Full gate passed: lane check, format, lint, typecheck, i18n (70 keys × 2), 140/140 unit, contracts, db (live pgvector), ml (ruff + 7 pytest), breaking, build (turbo 3/3), integration, Schemathesis fuzz **62/62 operations, 822 cases passed**, e2e smoke, gitleaks (no leaks), audit (3 moderate, pre-existing). | ☑ PASS |
| 6 | `status.md` shows M2 — 100% | `node scripts/backlog-index.mjs` after this flip: M2 100% (TMU-ARC-001..015, TMU-CTR-001..007 DONE). | ☑ PASS |
| 7 | Human gate `contract-v1.0.0` | Pending human action: tag `contract-v1.0.0` on `main` after human review of the contract set. | ⏳ PENDING HUMAN |

## Honest caveats (recorded, not hidden)

- **Contract doc statuses**: the 25 `BE-*`/`FE-*` contract documents carry `status: draft` in
  front-matter. The roadmap M2 row requires them *merged* (met — they are on `main` and are the
  binding contract), and the M1 "every doc approved" gate covered `01-product`/`02-design` only.
  No task owns a contract-doc approval pass; **not silently dropped**: the handoff row below
  records it for the M3 planning pass (meta lane owns
  `docs/08-project/**` registers outside `_common`). Contract changes remain governed by
  `docs/04-contracts/README.md` regardless of front-matter status.
- **Schemathesis warnings**: 22 ops 404 / 24 ops 405 / 12 ops validation-mismatch — these are
  against the *mock* contract server (`tests/contract/run-contract.mjs`), which still implements
  only the four M0 GET routes with hard-coded examples. Zero failures; the warnings are the mock's
  missing coverage, which converts to real handler tests in M3 (`TMU-BE-*`).
- **`API-ADM-12`/`API-ADM-13` combined verbs**: registered as collection-POST upserts only because
  one operationId allows one method; GET/PATCH split filed as **`TMU-CTR-008`** (M7, P3). The M7
  roadmap row (`TMU-BE-039..048, TMU-FE-033..039`) does not list it — roadmap amendment is part of
  this handoff (docs lane; out of contracts lane here, so recorded rather than edited). The same
  applies to the M2 row, which predates `TMU-CTR-007`/`TMU-CTR-008` and still reads
  `TMU-CTR-001..006` — the M3 planning pass (below) should amend both rows.

## M3 Handoff Note

- **Milestone status**: M2 is 100% complete (22/22 tasks DONE: TMU-ARC-001..015, TMU-CTR-001..007,
  incl. the early-filed TMU-CTR-006).
- **Contract baseline**: 62 operations, `CONTRACT_VERSION` 1.0.0, tag `contract-v1.0.0` pending human.
- **Next milestone**: M3 (Walking skeleton) — auth (domain allowlist, seeded sessions), DB migrations
  `TMU-DB-001..005` (each self-contained per the TMU-CTR-006 reconciliation of BE-05: domain tables,
  `needs_reprocess`, FTS trigger and retention indexes land with their owning table migration),
  upload handshake, report create/read, `/home` shell, seeds, docker compose up.
- **Scheduler state**: `node scripts/next-task.mjs` has no M3 task files yet — M3 needs its own
  breakdown task (mirror of `TMU-META-004`) before implementation can be picked deterministically.

## Files expected to change

- `docs/08-project/tasks/TMU-CTR-007.md`
- `docs/08-project/reviews/TMU-CTR-007.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/contracts/TMU-CTR-007-m2-exit-checklist` created from `main`; status → `IN_PROGRESS`; all 21 deps DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Cross-check BE-03 catalog vs registry (script in temp, 62/62 exact match); 2) Verify all docs/03-architecture statuses approved (19/19 + ADR lifecycle note); 3) Run pnpm gate:full; 4) Record exit table + caveats + M3 handoff; 5) Review; 6) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | 62/62 BE-03 IDs == registry IDs (zero missing/extra); all architecture docs approved (ADR-0004/0006 `proposed` = pending DEC confirmations, lifecycle-correct); contract docs draft status + Schemathesis mock warnings + ADM-12/13 verb split recorded as caveats, follow-ups filed (TMU-CTR-008) / handed off (contract-doc approval pass, M7 roadmap amendment) |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate:full` → `OK gate(full) passed`: 140/140 unit, Schemathesis 62/62 ops / 822 cases passed, e2e smoke passed, gitleaks no leaks, audit 3 moderate (pre-existing) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-007.md` |
| 2026-10-03 | orchestrator | handoff | for M3 planning (meta lane): file the M3 task breakdown (TMU-DB-001..005, TMU-BE-001..008, TMU-FE-001..006 per roadmap M3 row) incl. the 4-item Schemathesis mock upgrade (real handler fixtures per TMU-BE task); contract-doc front-matter approval sweep to be owned by a docs-keeper/meta task before the M3 gate (see caveats) |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated (M2 100%) |

## Evidence

- Red: N/A — milestone exit checklist and verification task; ACs are machine-checked catalog/architecture verification, full gate execution, and handoff recording
- Green: `pnpm gate:full` → `OK gate(full) passed` (tail: `Schemathesis contract fuzz phase: OK`, e2e `1 passed`, `no leaks found`, `OK gate(full) passed`)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-007.md`

## Blockers

(none)
