---
id: TC-SRC
title: Test cases — SEARCH
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["AC", "BE-13"]
source_refs: ["FR-SRC-001..006", "US-020..022"]
---

# TC-SRC — browse and search

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-SRC-001 | Default browse returns only opposite-type OPEN/MATCHED reports | FR-SRC-001 | `tests/search/browse.spec.ts` |
| TC-SRC-002 | Caller's own reports are excluded | FR-SRC-001 | same |
| TC-SRC-003 | Hidden statuses (PENDING_REVIEW/REMOVED/CANCELLED/EXPIRED/RETURNED) never appear | FR-SRC-001 | same |
| TC-SRC-004 | `?type=` overrides the default | FR-SRC-001 | same |
| TC-SRC-005 | Multi-value filters (`?category=A&category=B`) work | FR-SRC-002 | `tests/search/filters.spec.ts` |
| TC-SRC-006 | Date-range filter uses occurred window overlap | FR-SRC-002 | same |
| TC-SRC-007 | Custody filter applies to FOUND only | FR-SRC-002 | same |
| TC-SRC-008 | Cursor pagination is stable (no duplicates, no gaps) under concurrent inserts | FR-SRC-002 | `tests/search/pagination.spec.ts` |
| TC-SRC-009 | `limit` > 50 → 422 | FR-SRC-002 | `tests/search/validation.spec.ts` |
| TC-SRC-010 | Text search finds reports by Indonesian words (prefix match) | FR-SRC-003 | `tests/search/text.spec.ts` |
| TC-SRC-011 | Text search respects visibility and masking | FR-SRC-003 | same |
| TC-SRC-012 | ILIKE fallback returns results for typos | FR-SRC-003 | same |
| TC-SRC-013 | Image search uses the caller's READY upload embedding | FR-SRC-004 | `tests/search/image.spec.ts` |
| TC-SRC-014 | Image search with a foreign upload → NOT_FOUND | FR-SRC-004 | same |
| TC-SRC-015 | Search with neither `q` nor `imageUploadId` → 422 | FR-SRC-005 | `tests/search/validation.spec.ts` |
| TC-SRC-016 | Hits with a stored match include `band` + `reasons` and no score | FR-SRC-006 | `tests/search/hits.spec.ts` |
| TC-SRC-017 | `POST /search` rate limit 30/min | BE-12 | `tests/search/rate-limit.spec.ts` |
| TC-SRC-018 | Sensitive hits are masked/generalized in search results | FR-REP-009 | `tests/search/masking.spec.ts` |
