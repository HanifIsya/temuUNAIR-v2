---
id: TC-MAT
title: Test cases — MATCH
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["AC", "MATCH-SPEC", "BE-13"]
source_refs: ["FR-MAT-001..007", "US-023..026"]
---

# TC-MAT — matching

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-MAT-001 | After processing a similar FOUND report, a match with band ≥ POSSIBLE exists | FR-MAT-001 | `tests/jobs/match.spec.ts` |
| TC-MAT-002 | Below-threshold pairs are not stored | FR-MAT-001 | same |
| TC-MAT-003 | At most top 10 matches per report are kept | FR-MAT-001 | same |
| TC-MAT-004 | `GET /reports/{id}/matches` returns sorted results with reasons, no score | FR-MAT-002 | `tests/matches/list.spec.ts` |
| TC-MAT-005 | Non-owner gets `FORBIDDEN`/`NOT_FOUND` on matches | FR-MAT-002 | same |
| TC-MAT-006 | Dismiss sets `DISMISSED`; a rematch does not recreate the pair | FR-MAT-003 | `tests/matches/dismiss.spec.ts` |
| TC-MAT-007 | Dismiss by either party is allowed; third parties are not | FR-MAT-003 | same |
| TC-MAT-008 | Invite notifies the LOST owner; rate-limited | FR-MAT-004 | `tests/matches/invite.spec.ts` |
| TC-MAT-009 | Rematch enqueues a job; second call within 10 min → 429 | FR-MAT-005 | `tests/matches/rematch.spec.ts` |
| TC-MAT-010 | A match never changes report status or releases anything (DEC-012) | FR-MAT-006 | `tests/matches/advisory.spec.ts` |
| TC-MAT-011 | `algo_version` and per-signal `components` stored on every match | FR-MAT-007 | `tests/jobs/match.spec.ts` |
| TC-MAT-012 | Hard filters: same reporter never matches; category groups enforced | MATCH-SPEC §1 | `tests/matching/hard-filters.spec.ts` |
| TC-MAT-013 | Time filter: found ≥ lost−1d and within 60d of the lost window | MATCH-SPEC §1 | same |
| TC-MAT-014 | Candidate retrieval caps at ≤100 and uses the three HNSW indexes | MATCH-SPEC §2 | `tests/matching/retrieval.spec.ts` |
| TC-MAT-015 | Weight renormalisation when one side lacks a usable image | MATCH-SPEC §4 | `tests/matching/weights.spec.ts` |
| TC-MAT-016 | `reasons[]` includes signals ≥ 0.6 only | MATCH-SPEC §6 | `tests/matching/reasons.spec.ts` |
| TC-MAT-017 | Sensitive reports still match; no holder names/numbers involved | MATCH-SPEC §7 | `tests/matching/sensitive.spec.ts` |
| TC-MAT-018 | Rematch upserts (no duplicate pair rows) | BE-07 idempotency | `tests/jobs/match.spec.ts` |
| TC-MAT-019 | STRONG notifies immediately; POSSIBLE is batched in the digest | FR-NTF-001 | `tests/notifications/match-band.spec.ts` |
