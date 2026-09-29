---
id: TC-REP
title: Test cases — REPORT
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["AC", "BE-13"]
source_refs: ["FR-REP-001..011", "US-010..016"]
---

# TC-REP — reporting

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-REP-001 | Valid FOUND create returns 201, status OPEN, no hint answers echoed | FR-REP-001 | `tests/reports/create-found.spec.ts` |
| TC-REP-002 | FOUND without an image → 422 | FR-REP-001 | same |
| TC-REP-003 | FOUND without custody → 422 | FR-REP-004 | same |
| TC-REP-004 | Sensitive FOUND with 1 hint → 422; with 2 hints → 201 | FR-REP-005 | `tests/reports/sensitive.spec.ts` |
| TC-REP-005 | LOST with custody or hints → 422 | FR-REP-001 | `tests/reports/create-lost.spec.ts` |
| TC-REP-006 | LOST without images → 201 | FR-REP-006 | same |
| TC-REP-007 | Future `occurredAt.from` → 422 | FR-REP-002 | `tests/reports/validation.spec.ts` |
| TC-REP-008 | LOST older than 180 days → 422 | FR-REP-002 | same |
| TC-REP-009 | Title/description bounds enforced (3–80 / 10–1000) | FR-REP-002 | same |
| TC-REP-010 | Attaching another user's upload → 422/NOT_FOUND | FR-REP-003 | `tests/reports/create-found.spec.ts` |
| TC-REP-011 | More than 5 images → `UPLOAD_LIMIT_REACHED` | FR-REP-003 | `tests/reports/limits.spec.ts` |
| TC-REP-012 | `report.process` enqueued on create (idempotent) | FR-REP-001 | `tests/reports/create-found.spec.ts` |
| TC-REP-013 | `Idempotency-Key` same key+body returns the original response | BE-01 | `tests/reports/idempotency.spec.ts` |
| TC-REP-014 | Same key, different body → `IDEMPOTENCY_CONFLICT` | BE-01 | same |
| TC-REP-015 | PATCH with stale `If-Match` → `409 CONFLICT_STATE` | FR-REP-007 | `tests/reports/update.spec.ts` |
| TC-REP-016 | PATCH changing text re-enqueues `report.process` | FR-REP-007 | same |
| TC-REP-017 | Cancel with an APPROVED claim → 409; otherwise CANCELLED | FR-REP-008 | `tests/reports/cancel.spec.ts` |
| TC-REP-018 | Renew inside grace → OPEN + extended TTL + `report.match` enqueued | FR-REP-008 | `tests/reports/renew.spec.ts` |
| TC-REP-019 | Renew outside grace → 409 | FR-REP-008 | same |
| TC-REP-020 | Sensitive report public view: masked image, `url:null`, generalized text | FR-REP-009 | `tests/reports/sensitive.spec.ts` |
| TC-REP-021 | Two distinct flags → PENDING_REVIEW and hidden from browse | FR-REP-010 | `tests/reports/flags.spec.ts` |
| TC-REP-022 | Same user flagging twice does not count twice | FR-REP-010 | same |
| TC-REP-023 | Owner view exposes `version`, `matchCount`, `hintPrompts`, `activeClaimId`, `geo` | FR-MGT-002 | `tests/reports/owner-view.spec.ts` |
| TC-REP-024 | Public view never exposes geo, emails, embeddings or scores | privacy | `tests/reports/public-view.spec.ts` |
| TC-REP-025 | Reports are never hard-deleted (cancel/expire/remove only) | FR-REP-011 | `tests/reports/lifecycle.spec.ts` |
| TC-REP-026 | `/reports/mine` filters by type/status with pagination | FR-MGT-001 | `tests/reports/mine.spec.ts` |

## Edge cases covered

Duplicate-report preview is a UI hint (E2E-02 variant), not a server rule; two claimants is
covered in TC-CLM.
