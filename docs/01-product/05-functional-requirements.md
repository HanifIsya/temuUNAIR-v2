---
id: FR
title: Functional requirements
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["PRD", "US", "BE-03", "BE-05", "FE-01"]
source_refs: ["proposal.pdf §C.2 Fitur 1–4 (via docs/_source/proposal-extract.md)", "Blueprint §5A", "DEC-004", "DEC-005", "DEC-007", "DEC-012", "DEC-014"]
---

# Functional requirements

Grammar: **The system shall …**. Each FR carries MoSCoW priority and links to the API ID(s)
that implement it. Acceptance criteria live in `07-acceptance-criteria.md`.

## AUTH

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-AUTH-001 | The system shall authenticate users through Google OAuth and create a database session (30 days, sliding) | Must | API-ME-01 |
| FR-AUTH-002 | The system shall restrict sign-in to email domains listed in `AUTH_ALLOWED_DOMAINS` and reject others with `AUTH_DOMAIN_NOT_ALLOWED` | Must | — (Auth.js callback) |
| FR-AUTH-003 | The system shall block suspended accounts on every request with `ACCOUNT_SUSPENDED` | Must | all |
| FR-AUTH-004 | The system shall let users update display name and locale and read/update notification preferences | Should | API-ME-02, ME-04, ME-05 |
| FR-AUTH-005 | The system shall schedule account deletion with a 7-day cool-off, then anonymize the user and remove their images while keeping audit stubs | Must | API-ME-03 |

## REPORT

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-REP-001 | The system shall create a LOST or FOUND report from `ReportCreate`, enforcing cross-field rules (FOUND: ≥1 image, custody required, ≥1 hint / ≥2 if sensitive; LOST: hints and custody forbidden) | Must | API-REP-01 |
| FR-REP-002 | The system shall require a title (3–80), description (10–1000), category, campus and occurred-at window not older than 180 days for LOST | Must | API-REP-01 |
| FR-REP-003 | The system shall accept 0–5 images per report and link only uploads owned by the reporter with status `READY` | Must | API-REP-01, UPL-01..03 |
| FR-REP-004 | The system shall record FOUND custody as `HELD_BY_FINDER` or `AT_DROP_POINT` (with a valid drop point) | Must | API-REP-01 |
| FR-REP-005 | The system shall store 1–3 verification hints for FOUND reports with answers encrypted at rest (AES-GCM) and never echoed to non-owners | Must | API-REP-01, CLM-01 |
| FR-REP-006 | The system shall allow LOST reports without images | Must | API-REP-01 |
| FR-REP-007 | The system shall allow the owner to update a report while `OPEN`/`MATCHED` with `If-Match` concurrency control, re-enqueueing processing when text or images change | Must | API-REP-05 |
| FR-REP-008 | The system shall allow the owner to cancel a report (no approved claim) and to renew an `EXPIRED` report within the 30-day grace | Must | API-REP-06, REP-07 |
| FR-REP-009 | The system shall mark sensitive categories (`ID_CARD`, `BANK_CARD`, `WALLET` sensitive-lite) with `isSensitive` and mask their photos and generalize public text | Must | API-REP-01, REP-02 |
| FR-REP-010 | The system shall let any authenticated user flag a report with a reason; ≥2 distinct flaggers moves it to `PENDING_REVIEW` | Should | API-REP-08, ADM-16 |
| FR-REP-011 | The system shall never hard-delete reports by user action (cancel/expire/remove only) | Must | API-REP-06 |

## SEARCH

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-SRC-001 | The system shall list reports of the opposite type by default, excluding the caller's own and non-visible statuses | Must | API-REP-02 |
| FR-SRC-002 | The system shall support filters: campus, category, date range, custody, and cursor pagination (limit ≤50) | Must | API-REP-02 |
| FR-SRC-003 | The system shall support text search over title/description/brand/colors using Postgres FTS (`simple`) | Must | API-SRC-01 |
| FR-SRC-004 | The system shall support image search using a READY upload's embedding | Should | API-SRC-01 |
| FR-SRC-005 | The system shall reject a search with neither `q` nor `imageUploadId` (`VALIDATION_FAILED`) | Must | API-SRC-01 |
| FR-SRC-006 | The system shall return search hits with band and reasons when a match exists, without raw scores | Should | API-SRC-01 |

## MATCH

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-MAT-001 | The system shall compute matches asynchronously after processing and store matches with band ≥ `POSSIBLE`, keeping at most the top 10 per report | Must | API-MAT-04 |
| FR-MAT-002 | The system shall expose match suggestions to the report owner sorted by score, with explainable reasons and no raw score | Must | API-MAT-01 |
| FR-MAT-003 | The system shall let either party dismiss a match; dismissed pairs are not re-suggested unless `algo_version` changes | Must | API-MAT-02 |
| FR-MAT-004 | The system shall let a finder invite a LOST report owner to review a possible match (rate-limited) | Should | API-MAT-03 |
| FR-MAT-005 | The system shall let the owner request a rematch at most once per 10 minutes | Should | API-MAT-04 |
| FR-MAT-006 | The system shall never auto-release items or reveal private details based on a match (DEC-012) | Must | — |
| FR-MAT-007 | The system shall record `algo_version` on every match and per-signal components for evaluation | Must | — |

## CLAIM

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-CLM-001 | The system shall show a claimant only the hint *prompts* (never answers) and require answers to 1–3 of them | Must | API-CLM-01, CLM-02 |
| FR-CLM-002 | The system shall show the finder (and moderators) claimant answers side-by-side with expected answers | Must | API-CLM-04 |
| FR-CLM-003 | The system shall let the finder or a moderator approve/reject a claim; approval sets the report to `IN_VERIFICATION` and rejects other open claims | Must | API-CLM-05, CLM-06 |
| FR-CLM-004 | The system shall let either party dispute a claim, routing it to the moderator queue | Must | API-CLM-10, ADM-05 |
| FR-CLM-005 | The system shall let a claimant cancel a claim; an `APPROVED` claim may be cancelled by the finder with a reason | Should | API-CLM-09 |
| FR-CLM-006 | The system shall forbid claiming one's own report (`SELF_CLAIM_NOT_ALLOWED`) and claiming a non-claimable report (`REPORT_NOT_CLAIMABLE`) | Must | API-CLM-02 |
| FR-CLM-007 | The system shall allow at most one active claim per claimant per found report, at most one `APPROVED` claim per report, and ≤3 claims/day | Must | API-CLM-02 |
| FR-CLM-008 | The system shall block a claimant after 3 rejections on the same report | Must | API-CLM-02 |
| FR-CLM-009 | The system shall expire `SUBMITTED` claims after 72 h (reminder at 48 h) and escalate one-sided confirmations older than 72 h to `DISPUTED` (never auto-complete) | Must | sweep jobs |

## CHAT

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-CHT-001 | The system shall create a chat thread per claim, accessible only to the parties and moderators | Must | API-CHT-01 |
| FR-CHT-002 | The system shall send text messages ≤1000 chars, rate-limited to 20/min, and block sending on closed claims | Must | API-CHT-02 |
| FR-CHT-003 | The system shall expose messages by cursor and support read receipts (`upToMessageId`) | Should | API-CHT-01, CHT-04 |
| FR-CHT-004 | The system shall upgrade the transport to SSE without changing components (phase 2) | Could | API-CHT-03 |

## HANDOVER

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-HND-001 | The system shall let either party save a handover plan (place, time, optional note) on an `APPROVED` claim, suggesting drop points | Must | API-CLM-07 |
| FR-HND-002 | The system shall complete the claim and mark both reports `RETURNED` only after **both** parties confirm the handover | Must | API-CLM-08 |
| FR-HND-003 | The system shall surface safety guidance ("meet in a busy campus area") on the handover panel and in `/help/safety` | Should | FE |

## NOTIFICATION

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-NTF-001 | The system shall notify a report owner when a match with band ≥ POSSIBLE appears (email for STRONG immediately; POSSIBLE batched in the daily digest) | Must | API-NTF-01 |
| FR-NTF-002 | The system shall notify the finder when a claim is submitted and remind at 48 h | Must | API-NTF-01 |
| FR-NTF-003 | The system shall notify the counterpart on new messages (email digest if unread 15 min) | Must | API-NTF-01 |
| FR-NTF-004 | The system shall notify owners 14 days before expiry and on expiry | Should | API-NTF-01 |
| FR-NTF-005 | The system shall dedupe notifications by `dedupe_key` | Must | — |
| FR-NTF-006 | The system shall honour per-user `email_enabled` and `muted_types` | Should | API-ME-04, ME-05 |
| FR-NTF-007 | The system shall expose unread count, mark-one-read and mark-all-read | Must | API-NTF-02..04 |

## MANAGE

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-MGT-001 | The system shall list the caller's reports with type/status filters and owner view fields | Must | API-REP-03 |
| FR-MGT-002 | The system shall expose owner-only fields (`version`, `matchCount`, `hintPrompts`, `activeClaimId`, `geo`) only to the owner/moderators | Must | API-REP-04 |

## ADMIN

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-ADM-001 | The system shall give moderators a queue of `PENDING_REVIEW` and flagged reports with approve/remove actions | Must | API-ADM-01..03 |
| FR-ADM-002 | The system shall let moderators resolve disputed claims with a required note, logged to audit | Must | API-ADM-05, ADM-06 |
| FR-ADM-003 | The system shall let admins suspend/unsuspend users and change roles (never demoting themselves) | Must | API-ADM-07..10 |
| FR-ADM-004 | The system shall let admins CRUD locations and drop points | Should | API-ADM-12, ADM-13 |
| FR-ADM-005 | The system shall record every privileged mutation in an append-only audit log | Must | API-ADM-14 |
| FR-ADM-006 | The system shall expose usage statistics filtered by date and campus | Should | API-ADM-11 |
| FR-ADM-007 | The system shall restrict moderation to the moderator's own campus; admins are global | Must | RBAC matrix |
| FR-ADM-008 | The system shall let only admins trigger a matching reindex | Must | API-ADM-15 |
| FR-ADM-009 | The system shall let moderators resolve flags with an action and note | Should | API-ADM-17 |

## I18N

| ID | Requirement | Priority | API |
|---|---|---|---|
| FR-I18N-001 | The system shall serve UI in Bahasa Indonesia by default and English as an option, persisting the choice per user | Must | API-ME-02 |
| FR-I18N-002 | The system shall render dates/times in `Asia/Jakarta` and store/transport ISO-8601 with offset | Must | — |
| FR-I18N-003 | The system shall return i18n keys (`labelKey`) rather than translated strings from the API | Must | — |
