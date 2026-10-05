---
id: REV-TMU-DOC-005
task: TMU-DOC-005
title: "Review and approve the requirements docs (US, FR, NFR)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DOC-005 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/docs/TMU-DOC-005-review-requirements-docs`.
Files reviewed: `04-user-stories.md`, `05-functional-requirements.md`, `06-non-functional-requirements.md`, `tasks/TMU-DOC-005.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
All three requirements documents (`04-user-stories.md`, `05-functional-requirements.md`, `06-non-functional-requirements.md`)
have been audited against their Blueprint §4 rows, verified for bidirectional US↔FR trace integrity,
and approved. Every one of the 59 functional requirements links to a user story, and every user story
points to valid FRs with MoSCoW priorities intact.

## Blueprint §4 Specification Audit

### 1. `docs/01-product/04-user-stories.md`

Blueprint §4 requirements: *`US-###` "As a … I want … so that …", linked to FR and priority*

| Area | Status | Verification Detail |
|---|---|---|
| Grammar | PASS | All stories strictly follow standard format: `As a <persona> I want <capability> so that <benefit>`. |
| Priorities | PASS | Every story assigned MoSCoW priority (`Must` or `Should`). |
| US↔FR links | PASS | All 39 user stories link to one or more valid `FR-*` IDs. Missing mappings closed: US-044 added for chat notifications (FR-NTF-003); US-045 added for unread counts and batch read (FR-NTF-005, FR-NTF-007); US-057 added for matching reindex (FR-ADM-008). |
| Source refs | PASS | Refreshed from stale `(pending extract)` to `proposal.pdf §C.2 Fitur 1–4 (via docs/_source/proposal-extract.md)`. |
| Front-matter | PASS | `status: approved`, `updated: 2026-10-03`. |

### 2. `docs/01-product/05-functional-requirements.md`

Blueprint §4 requirements: *`FR-<MOD>-###` for AUTH, REP, SRC, MAT, CLM, CHT, HND, NTF, MGT, ADM, I18N*

| Module | Count | Status | Verification Detail |
|---|---|---|---|
| AUTH | 5 | PASS | FR-AUTH-001..005: Google OAuth, allowed domains, suspension, preferences, deletion. |
| REPORT | 11 | PASS | FR-REP-001..011: report creation, required fields, photo count, custody, hints, soft deletion. |
| SEARCH | 6 | PASS | FR-SRC-001..006: opposite type listing, filters, FTS, image search, query validation, hit formatting. |
| MATCH | 7 | PASS | FR-MAT-001..007: async matching, suggestion delivery, dismissal, invites, rematch throttle, advisory guardrail, algo versioning. |
| CLAIM | 9 | PASS | FR-CLM-001..009: hint challenge, side-by-side verification, approve/reject, disputes, cancellations, quota/rejection limits, sweep expiration. |
| CHAT | 4 | PASS | FR-CHT-001..004: per-claim chat, length/rate limits, cursor/read receipts, SSE upgrade path. |
| HANDOVER | 3 | PASS | FR-HND-001..003: handover plan, two-sided confirmation, safety guidance. |
| NOTIFICATION | 7 | PASS | FR-NTF-001..007: match alerts, claim alerts, chat digests, expiry warnings, deduplication, user prefs, unread counts. |
| MANAGE | 2 | PASS | FR-MGT-001..002: report listings, owner/moderator private fields. |
| ADMIN | 9 | PASS | FR-ADM-001..009: review queue, dispute resolution, user suspension, location/drop point CRUD, audit logging, stats, campus scoping, reindexing, flag resolution. |
| I18N | 3 | PASS | FR-I18N-001..003: id/en default and switch, Asia/Jakarta timestamp, API label keys. |
| MoSCoW | 59/59 | PASS | Every FR explicitly specifies `Must`, `Should`, or `Could`. |
| Source refs | PASS | Refreshed from stale `(pending extract)` to `proposal.pdf §C.2 Fitur 1–4 (via docs/_source/proposal-extract.md)`. |
| Front-matter | PASS | `status: approved`, `updated: 2026-10-03`. |

### 3. `docs/01-product/06-non-functional-requirements.md`

Blueprint §4 requirements: *Performance, availability, security, privacy, accessibility, i18n, browser/device support, retention, scale numbers*

| Category | IDs | Status | Verification Detail |
|---|---|---|---|
| Performance | NFR-001..006 | PASS | Concrete latency (300 ms read, 500 ms write, 3 s ML), LCP ≤ 2.5 s, bundle ≤ 250 kB, top-10 pagination. |
| Availability | NFR-010..013 | PASS | 99.0% uptime, 3 background retries, `/readyz` dependency checks, 24 h idempotency keys. |
| Security | NFR-020..026 | PASS | RBAC with IDOR prevention, AES-GCM encrypted hints, signed image URLs, rate limiting, audit log, gitleaks, CSRF tokens and cookies. |
| Privacy | NFR-030..035 | PASS | UU PDP purpose limitation, geo-masking, 7-day cool-off deletion, 90-day retention TTL with 30-day grace, login-only browsing, terms. |
| Accessibility | NFR-040..043 | PASS | WCAG 2.2 AA, keyboard operability, no color-only state, reduced motion, 44×44 px touch targets. |
| I18N | NFR-050..052 | PASS | id/en support, Asia/Jakarta timezone, CI key completeness check. |
| Browser/Device | NFR-060..061 | PASS | Modern browsers (last 2 versions), 360 px minimum width. |
| Scalability | NFR-070..072 | PASS | 5,000 users, 2,000 active reports, 500 matches/day, 20 concurrent users, pg-boss async queue. |
| Observability | NFR-080..083 | PASS | Gate compliance, structured logging with PII redaction, `/healthz` & `/readyz`, reproducible contracts. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`; stale "TBD" preamble removed. |

## Acceptance Criteria Verification

- [x] **AC 1 (Section Completeness):** All required sections per Blueprint §4 are present in all three documents.
- [x] **AC 2 (US↔FR Resolution):** Bidirectional links fully resolved. All 59 FRs are referenced by at least one US. Zero orphan FRs. MoSCoW priorities present on every FR.
- [x] **AC 3 (Findings Fixed):** Missing mappings closed, stale source refs corrected, stale preamble updated.
- [x] **AC 4 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set on all three docs.
- [x] **AC 5 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
