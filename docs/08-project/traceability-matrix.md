---
id: TRACEABILITY
title: Traceability matrix
status: draft
owner: DK
updated: 2026-09-29
depends_on: ["PRD", "FR", "SCR-INDEX", "BE-03", "FE-12"]
source_refs: ["Blueprint §4.1, §12"]
---

# Traceability matrix

Links goals → stories → requirements → screens → APIs → tests → tasks. A merged task is
incomplete until its row is updated (docs-keeper). Rows with `—` are pending later milestones.

## Goals → stories → requirements

| Goal | Stories | FRs | Screens | APIs | Tests | Tasks |
|---|---|---|---|---|---|---|
| G1 Fast reporting | US-010, US-011, US-013, US-014 | FR-REP-001..008, FR-AUTH-001 | SCR-004, SCR-003 | API-REP-01..08, API-UPL-01..03, API-META-01..04 | TC-REP-001..019, E2E-02, E2E-03 | — |
| G2 AI matching | US-020..026 | FR-SRC-001..006, FR-MAT-001..007 | SCR-005, SCR-008 | API-REP-02, API-SRC-01, API-MAT-01..04 | TC-SRC-001..018, TC-MAT-001..019, E2E-04, E2E-05 | — |
| G3 Verified return | US-030..037 | FR-CLM-001..009, FR-CHT-001..004, FR-HND-001..003 | SCR-006, SCR-010..012 | API-CLM-01..10, API-CHT-01..04 | TC-CLM-001..022, TC-CHT-001..007, TC-HND-001..005, E2E-06..09 | — |
| G4 Moderation | US-050..056 | FR-ADM-001..009, FR-MGT-001..002, FR-REP-010 | SCR-009, SCR-017..022 | API-ADM-01..17, API-REP-03/06/07 | TC-ADM-001..014, E2E-11, E2E-12 | — |
| G5 Lawful & trustworthy | US-004, US-015, US-042 | FR-AUTH-005, FR-REP-009, FR-NTF-006, NFR-030..035 | SCR-014, SCR-016, SCR-018 | API-ME-03..05, API-REP-09 (masking) | TC-AUTH-006..008, TC-REP-020/024, security checklist | — |

## Requirements → APIs → screens

| FR group | APIs | Screens | Contracts |
|---|---|---|---|
| AUTH | API-ME-01..05 + Auth.js | SCR-002, SCR-014 | BE-09 |
| REPORT | API-REP-01..08, API-UPL-01..03, API-META-01..04 | SCR-004, SCR-006, SCR-007, SCR-009 | BE-03, BE-05, BE-10 |
| SEARCH | API-REP-02, API-SRC-01 | SCR-005 | BE-03, ARCH-SEARCH |
| MATCH | API-MAT-01..04 | SCR-008 | BE-03, MATCH-SPEC |
| CLAIM | API-CLM-01..10 | SCR-011, SCR-012 | BE-03, ARCH-STATES |
| CHAT | API-CHT-01..04 | SCR-012 | BE-03, ARCH-CHAT |
| HANDOVER | API-CLM-07..08 | SCR-012 | BE-03 |
| NOTIFICATION | API-NTF-01..04 | SCR-013 | BE-08 |
| MANAGE | API-REP-03/06/07 | SCR-009 | BE-03 |
| ADMIN | API-ADM-01..17 | SCR-017..022 | BE-03, BE-09 |
| I18N | — | all | ARCH-I18N, FE-08 |

## Test coverage map

| Test area | Files | Status |
|---|---|---|
| AUTH | `docs/06-quality/02-test-cases/TC-AUTH.md` | specified |
| REPORT | `TC-REP.md` | specified |
| SEARCH | `TC-SRC.md` | specified |
| MATCH | `TC-MAT.md` | specified |
| CLAIM/CHAT/HANDOVER | `TC-CLM.md` | specified |
| ADMIN/NOTIFICATION/I18N | `TC-ADM.md` | specified |
| E2E | `03-e2e-scenarios.md` (E2E-01..15) | specified |

## How to update

1. docs-keeper adds/updates the task column when a task is merged.
2. A new FR/API/SCR must appear here in the same PR that introduces it.
3. Orphan rows (FR without API, API without test) are review findings at milestone gates.
4. The matrix is checked at each milestone gate; `status.md` shows task-level progress.
