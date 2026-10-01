---
id: E2E
title: E2E scenarios
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["FE-12", "TEST-STRATEGY"]
source_refs: ["Blueprint §5B.10"]
---

# E2E scenarios (Playwright, `ML_MODE=stub`)

Deterministic: stubbed ML, seeded ids, no sleeps, assertions on `data-testid`s. Each scenario
creates its own data through the API where practical.

| ID | Scenario | Steps (summary) | Key assertions |
|---|---|---|---|
| E2E-01 | Login and domain restriction | 1) Login with an allowed-domain test account 2) attempt a disallowed domain | session cookie set; `/auth/error` shows the domain message for the disallowed case |
| E2E-02 | Create LOST report with photo | wizard → category → photo → details → where/when → review → submit | 201; appears in `/me/reports`; `report_submitted` event emitted |
| E2E-03 | Create FOUND report (custody + hints) | wizard → photo required → custody `AT_DROP_POINT` → 2 hints → submit | 201; hints never visible on the public view; custody label correct |
| E2E-04 | Match suggestion appears | seed a similar FOUND report, trigger processing | LOST owner sees a `MatchCard` with band + reasons; no numeric score |
| E2E-05 | Browse + text search + image search + filters | browse → filter by campus/category → text query → image query | result counts change; URL carries filters; masked items stay masked |
| E2E-06 | Claim with hidden-detail answers → approval | claimant opens challenge → answers → finder compares → approves | claim `APPROVED`; report `IN_VERIFICATION`; other claims rejected |
| E2E-07 | Claim rejected → claimant sees reason | finder rejects with reason | claimant sees the reason in the claim room; can dispute |
| E2E-08 | Chat exchange; notification bell updates | both parties send messages | messages appear within polling window; unread count increments then clears on read |
| E2E-09 | Handover with two-sided confirmation | plan → claimant confirms → finder confirms | claim `COMPLETED`; both reports `RETURNED`; `REPORT_RETURNED` notifications |
| E2E-10 | Sensitive item protections | create `ID_CARD` FOUND | photo masked publicly, description generalized, 1 hint rejected / 2 accepted |
| E2E-11 | Flag → moderation → remove | two users flag a report → moderator removes | report leaves browse; owner notified with reason; audit row exists |
| E2E-12 | Admin resolves a disputed claim | dispute → moderator decides with note | claim state updated; note stored; parties notified |
| E2E-13 | Report expiry and renew | force-expire via clock/seed → owner renews | `EXPIRED` → `OPEN`, TTL extended, rematch enqueued |
| E2E-14 | Mobile viewport smoke | E2E-02/03/06 at 390×844 | bottom nav visible; no horizontal scroll; touch targets ≥ 44 px |
| E2E-15 | Locale switch persists | switch id→en on settings → navigate → reload | all strings change; preference persists via `PATCH /me` |

## Test data strategy

- Seeded users: `loser@example.test`, `finder@example.test`, `moderator.a@example.test`,
  `admin@example.test` (domain allowlisted in the test env).
- Fixtures: synthetic images (one normal, one sensitive-looking card).
- `ML_MODE=stub` returns fixed vectors so E2E-04 is deterministic.
- Expiry scenarios use the seeded clock override (test-only endpoint or seed data with past
  timestamps).

## Running

```bash
pnpm --filter @temuunair/e2e-tests exec playwright install --with-deps chromium
ML_MODE=stub pnpm test:e2e            # local
ML_MODE=stub pnpm test:e2e -- --project=mobile
```

Artifacts (trace, screenshots) upload on failure in CI. A flaky scenario is quarantined with a
blocker file, never retried until green.
