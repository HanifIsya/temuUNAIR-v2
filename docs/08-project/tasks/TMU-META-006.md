---
id: TMU-META-006
title: File the M2 task breakdown (TMU-ARC-001..015, TMU-CTR-001..005, TMU-CTR-007)
status: DONE
lane: meta
slug: file-m2-backlog
milestone: M2
priority: P1
owner: orchestrator
deps: [TMU-DOC-020]
refs: [ROADMAP, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-META-006 — File the M2 task breakdown (TMU-ARC-001..015, TMU-CTR-001..005, TMU-CTR-007)

## Goal

File the complete Milestone M2 task breakdown across architecture docs (`TMU-ARC-001..015`),
full contract schemas and registry implementation (`TMU-CTR-001..005`), and the M2 milestone exit
checklist (`TMU-CTR-007`) per the Blueprint §4 and Roadmap requirements, so that M2 execution
can proceed deterministically through `scripts/next-task.mjs`.

## Context

- M1 exit is complete (`TMU-DOC-020` is DONE); all 24 M1 tasks are DONE.
- `TMU-CTR-006` (BE-05 post-init reconciliation) was filed early in M0 and is already DONE.
- Roadmap M2 row (`docs/01-product/10-roadmap.md:21`) promises:
  `docs/03-architecture/**` + `docs/04-contracts/**` merged; `packages/contracts` builds;
  OpenAPI + client + MSW generated; `contracts:check` green.
  Key tasks: `TMU-ARC-001..015, TMU-CTR-001..006`.
- Blueprint §4.4 specifies 15 architecture review/approval areas (`01-system-overview.md` through `19-i18n-design.md` and ADRs).
- Blueprint §4.5 and `BE-03` specify the complete HTTP API route catalog to be authored in `packages/contracts/src/registry.ts`.
- M2 exit checklist is `TMU-CTR-007`, depending on all M2 architecture and contract tasks.

## Tasks filed

| ID | Title | Lane | Owner | Priority | Deps |
|---|---|---|---|---|---|
| TMU-ARC-001 | Review and approve System Overview (`01-system-overview.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-002 | Review and approve Tech Stack and Versions (`02-tech-stack-and-versions.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-003 | Review and approve Data Model and ERD (`03-data-model-erd.md`) | arch | architect | P2 | [TMU-DOC-020, TMU-CTR-006] |
| TMU-ARC-004 | Review and approve State Machines (`04-state-machines.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-005 | Review and approve Matching Algorithm Spec (`05-matching-algorithm-spec.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-006 | Review and approve ML Service Design (`06-ml-service-design.md`) | ml | ml-dev | P2 | [TMU-DOC-020] |
| TMU-ARC-007 | Review and approve ML Evaluation Plan (`07-ml-evaluation-plan.md`) | ml | ml-dev | P2 | [TMU-DOC-020] |
| TMU-ARC-008 | Review and approve Async Jobs and Queues (`08-async-jobs-and-queues.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-009 | Review and approve Storage and Media Pipeline (`09-storage-and-media-pipeline.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-010 | Review and approve Auth and RBAC (`10-auth-and-rbac.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-011 | Review and approve Notification Design (`11-notification-design.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-012 | Review and approve Chat Design (`12-chat-design.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-013 | Review and approve Search Design (`13-search-design.md`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-ARC-014 | Review and approve Security Threat Model and Privacy (`14-security-threat-model.md`, `15-privacy-and-data-retention.md`) | sec | security-reviewer | P2 | [TMU-DOC-020] |
| TMU-ARC-015 | Review and approve Observability, Capacity, Topology, i18n and ADRs (`16-observability.md`, `17-performance-and-capacity.md`, `18-deployment-topology.md`, `19-i18n-design.md`, `adr/*`) | arch | architect | P2 | [TMU-DOC-020] |
| TMU-CTR-001 | Author contract schemas for ME, preferences and uploads (`API-ME-*`, `API-UPL-*`, `API-META-02/04`) | contracts | architect | P2 | [TMU-DOC-020, TMU-ARC-001] |
| TMU-CTR-002 | Author contract schemas for reports (`API-REP-01..08`) | contracts | architect | P2 | [TMU-DOC-020, TMU-CTR-001, TMU-ARC-004] |
| TMU-CTR-003 | Author contract schemas for search and matching (`API-SRC-01`, `API-MAT-01..04`) | contracts | architect | P2 | [TMU-DOC-020, TMU-CTR-002, TMU-ARC-005] |
| TMU-CTR-004 | Author contract schemas for claims, chat and handover (`API-CLM-01..10`, `API-CHT-01..04`) | contracts | architect | P2 | [TMU-DOC-020, TMU-CTR-002, TMU-ARC-004] |
| TMU-CTR-005 | Author contract schemas for notifications and admin operations (`API-NTF-01..04`, `API-ADM-01..17`) | contracts | architect | P2 | [TMU-DOC-020, TMU-CTR-004, TMU-ARC-010] |
| TMU-CTR-007 | M2 exit checklist, contracts/architecture approval evidence and M3 handoff | contracts | orchestrator | P1 | [TMU-ARC-001, TMU-ARC-002, TMU-ARC-003, TMU-ARC-004, TMU-ARC-005, TMU-ARC-006, TMU-ARC-007, TMU-ARC-008, TMU-ARC-009, TMU-ARC-010, TMU-ARC-011, TMU-ARC-012, TMU-ARC-013, TMU-ARC-014, TMU-ARC-015, TMU-CTR-001, TMU-CTR-002, TMU-CTR-003, TMU-CTR-004, TMU-CTR-005, TMU-CTR-006] |

## Acceptance criteria

- [x] All 21 task files above are created under `docs/08-project/tasks/` with valid front-matter.
- [x] Task IDs match filenames; single-line `deps: [...]` format respected.
- [x] `node scripts/backlog-index.mjs` generates an updated backlog and status dashboard.
- [x] `node scripts/next-task.mjs` returns the first runnable M2 task (`TMU-ARC-001`).
- [x] `pnpm gate:quick` exits 0.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/meta/TMU-META-006-file-m2-backlog` created from `main`; status → `IN_PROGRESS` |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Create 21 M2 task files (TMU-ARC-001..015, TMU-CTR-001..005, TMU-CTR-007); 2) Regenerate backlog/status; 3) Verify next-task.mjs returns TMU-ARC-001; 4) Run pnpm gate:quick; 5) Review & ship |
| 2026-10-03 | orchestrator | 5 GREEN | Created all 21 task files; regenerated backlog/status to 70 tasks; verified next-task.mjs returns TMU-ARC-001 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` (lane check, 140/140 unit tests, contracts, db, ml) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-META-006.md` |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — task backlog decomposition task
- Green: `pnpm gate:quick` passed; `scaffold.test.mjs` passed 31/31 tests
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-META-006.md`

## Blockers

(none)

