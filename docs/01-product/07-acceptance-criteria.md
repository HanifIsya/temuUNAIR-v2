---
id: AC
title: Acceptance criteria
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["FR", "NFR", "US"]
source_refs: ["Blueprint §4.1, §5A.6", "DEC-004", "DEC-007", "DEC-014"]
---

# Acceptance criteria

Gherkin (`Given / When / Then`) derived from `05-functional-requirements.md`. Each block maps
to `TC-###` test cases in `docs/06-quality/02-test-cases/`. Edge cases are mandatory — a story is
not done until its edge cases pass.

## AUTH

### FR-AUTH-002 — domain allowlist
```gherkin
Scenario: Allowed domain signs in
  Given an email "budi@student.unair.ac.id" whose domain is in AUTH_ALLOWED_DOMAINS
  When the user completes Google OAuth
  Then a session is created and GET /me returns role USER

Scenario: Disallowed domain is rejected
  Given an email "someone@gmail.com" whose domain is not allowed
  When the user completes Google OAuth
  Then the response is 403 AUTH_DOMAIN_NOT_ALLOWED
  And no user row is created
```

### FR-AUTH-003 — suspended account
```gherkin
Scenario: Suspended user is blocked everywhere
  Given a user with status SUSPENDED and a valid session cookie
  When they call GET /reports
  Then the response is 403 ACCOUNT_SUSPENDED
```

### FR-AUTH-005 — account deletion
```gherkin
Scenario: Deletion anonymizes after cool-off
  Given a user with 2 reports and 3 messages
  When they call DELETE /me
  Then the response is 202
  And after the 7-day cool-off the user is anonymized, images removed, audit stubs kept
```

## REPORT

### FR-REP-001 — create FOUND with hints
```gherkin
Scenario: Valid FOUND report
  Given a READY upload owned by the reporter and 2 verification hints
  When the user POSTs a FOUND ReportCreate with custody HELD_BY_FINDER
  Then the response is 201 with status OPEN
  And the response never echoes the hint answers
  And a report.process job is enqueued

Scenario: FOUND without an image is rejected
  When the user POSTs a FOUND ReportCreate with imageIds []
  Then the response is 422 VALIDATION_FAILED

Scenario: Sensitive FOUND requires two hints
  Given category ID_CARD
  When the user POSTs a FOUND report with 1 hint
  Then the response is 422 VALIDATION_FAILED with a hint-count message

Scenario: LOST cannot carry custody or hints
  When the user POSTs a LOST report with custody AT_DROP_POINT
  Then the response is 422 VALIDATION_FAILED
```

### FR-REP-002 — time window validation
```gherkin
Scenario: Future occurred-from is rejected
  When occurredAt.from is tomorrow
  Then the response is 422 VALIDATION_FAILED

Scenario: LOST older than 180 days is rejected
  When occurredAt.from is 200 days ago
  Then the response is 422 VALIDATION_FAILED
```

### FR-REP-007 — concurrency
```gherkin
Scenario: Stale update is rejected
  Given a report at version 3
  When the owner PATCHes with If-Match: 2
  Then the response is 409 CONFLICT_STATE
```

### FR-REP-008 — cancel and renew
```gherkin
Scenario: Cancel with an approved claim fails
  Given a report in IN_VERIFICATION with an APPROVED claim
  When the owner cancels the report
  Then the response is 409 CONFLICT_STATE

Scenario: Renew inside the grace window
  Given a report EXPIRED 5 days ago
  When the owner renews
  Then status becomes OPEN and expires_at is now + REPORT_TTL_DAYS
  And a report.match job is enqueued
```

### FR-REP-009 / FR-REP-010 — sensitive and flags
```gherkin
Scenario: Sensitive report is masked publicly
  Given an ID_CARD report with a photo
  When another user opens GET /reports/{id}
  Then images[0].masked is true, url is null and the description is generalized

Scenario: Two flags hide the report
  Given two distinct users flag an OPEN report
  When the second flag is recorded
  Then the report status becomes PENDING_REVIEW and it disappears from browse/search
```

### Duplicate-report edge case
```gherkin
Scenario: Reporter is warned about a possible duplicate
  Given the reporter already has an OPEN FOUND report in the same category and campus
  When they start a new FOUND report
  Then the wizard shows a "laporan serupa" hint with a link (non-blocking)
```

## SEARCH

### FR-SRC-001 — opposite-type default
```gherkin
Scenario: Loser sees found items
  Given an authenticated user
  When they GET /reports without ?type
  Then only FOUND reports in OPEN/MATCHED are returned
  And none of the results are their own

Scenario: Hidden statuses never leak
  Given reports in PENDING_REVIEW, REMOVED, CANCELLED, EXPIRED and RETURNED
  When any non-owner browses
  Then none of those reports appear
```

### FR-SRC-005 — search input
```gherkin
Scenario: Empty search is rejected
  When POST /search has neither q nor imageUploadId
  Then the response is 422 VALIDATION_FAILED
```

## MATCH

### FR-MAT-001/002 — suggestions
```gherkin
Scenario: Match appears with reasons and no raw score
  Given a LOST report and a similar FOUND report processed by the worker
  When the owner GETs /reports/{lostId}/matches
  Then at least one MatchView with band STRONG or POSSIBLE is returned
  And each match has reasons[] with i18n labelKeys
  And the response contains no numeric score field

Scenario: Below-threshold pairs are not stored
  Given a similarity below MATCH_THRESHOLD_POSSIBLE
  Then no match row exists for the pair
```

### FR-MAT-003 — dismissal
```gherkin
Scenario: Dismissed pair is not re-suggested
  Given a SUGGESTED match
  When a party dismisses it
  Then its state is DISMISSED and a rematch does not recreate it
```

### FR-MAT-006 — advisory only
```gherkin
Scenario: A match never releases an item
  Given a STRONG match exists
  Then neither report changes status until a human claim flow completes
```

## CLAIM

### FR-CLM-001/002 — hidden-detail challenge
```gherkin
Scenario: Claimant sees prompts only
  When a non-owner calls GET /reports/{foundId}/challenge
  Then only hintId and prompt are returned, never answers

Scenario: Owner cannot claim own report
  When the finder calls the challenge endpoint on their own report
  Then the response is 403 SELF_CLAIM_NOT_ALLOWED

Scenario: Finder sees answers side by side
  Given a SUBMITTED claim
  When the finder calls GET /claims/{id}
  Then each answer row has claimantAnswer and expectedAnswer
```

### FR-CLM-007/008 — quotas and uniqueness
```gherkin
Scenario: One active claim per claimant per report
  Given a SUBMITTED claim by user A on report R
  When A submits a second claim on R
  Then the response is 409 CLAIM_ALREADY_ACTIVE

Scenario: Fourth claim of the day is blocked
  Given 3 claims created today by user A
  When A submits another
  Then the response is 429 CLAIM_LIMIT_EXCEEDED

Scenario: Three rejections block the claimant
  Given 3 REJECTED claims by A on report R
  When A submits again on R
  Then the response is 429 CLAIM_LIMIT_EXCEEDED
```

### FR-CLM-003 — decision
```gherkin
Scenario: Approval locks the claim
  Given two SUBMITTED claims on one found report
  When the finder approves claim 1
  Then claim 1 is APPROVED, claim 2 is REJECTED with reason "already approved"
  And the found report is IN_VERIFICATION
  And all SUGGESTED matches for that report are CLAIMED
```

### FR-CLM-004 — dispute
```gherkin
Scenario: Dispute reaches moderators
  When either party disputes a claim with a reason
  Then the claim is DISPUTED and a moderator notification is created
```

### FR-CLM-009 — expiry and escalation
```gherkin
Scenario: Unanswered claim expires
  Given a SUBMITTED claim older than 72 h
  When the sweep runs
  Then the claim is EXPIRED and the report returns to OPEN/MATCHED per R5

Scenario: One-sided confirmation never auto-completes
  Given an APPROVED claim with only the finder's confirmation older than 72 h
  When the sweep runs
  Then the claim becomes DISPUTED, not COMPLETED
```

## CHAT

### FR-CHT-002 — messaging rules
```gherkin
Scenario: Non-party cannot read the thread
  Given a claim between users A and B
  When user C calls GET /claims/{id}/messages
  Then the response is 403 FORBIDDEN

Scenario: Closed claim blocks sending
  Given a COMPLETED claim
  When a party sends a message
  Then the response is 409 CONFLICT_STATE

Scenario: Message length is bounded
  When a 1001-character body is sent
  Then the response is 422 VALIDATION_FAILED
```

## HANDOVER

### FR-HND-002 — two-sided confirmation
```gherkin
Scenario: Both confirmations are required
  Given an APPROVED claim
  When only the claimant confirms
  Then the claim is still APPROVED with claimantConfirmedAt set

Scenario: Completion marks both reports returned
  Given the claimant has confirmed
  When the finder confirms
  Then the claim is COMPLETED
  And both the FOUND and linked LOST reports are RETURNED with resolved_at set
  And other matches are INVALIDATED
```

## NOTIFICATION

### FR-NTF-005 — dedupe
```gherkin
Scenario: Duplicate notification is suppressed
  Given a notification with dedupe_key "claim:X:decision"
  When the same event fires again
  Then no second notification row is created
```

### FR-NTF-006 — preferences
```gherkin
Scenario: Email opt-out is respected
  Given a user with email_enabled false
  When a CLAIM_SUBMITTED notification is created
  Then the in-app row exists and emailed_at stays null
```

## ADMIN

### FR-ADM-002 — dispute resolution
```gherkin
Scenario: Moderator resolves a dispute
  Given a DISPUTED claim
  When a moderator posts resolve with decision REJECT and a note
  Then the claim is REJECTED, the note is stored, and an audit row is written
```

### FR-ADM-007 — campus scoping
```gherkin
Scenario: Moderator cannot act outside their campus
  Given a moderator scoped to KAMPUS_B
  When they try to remove a KAMPUS_A report
  Then the response is 403 FORBIDDEN
```

### FR-ADM-003 — self-demotion guard
```gherkin
Scenario: Admin cannot demote themselves
  When an admin PATCHes their own role to USER
  Then the response is 403 FORBIDDEN
```

## I18N

### FR-I18N-003 — keys not strings
```gherkin
Scenario: API returns i18n keys
  When a match is returned
  Then reasons[].labelKey is a key such as "match.reason.IMAGE_SIMILAR"
  And no server-translated sentence is present
```
