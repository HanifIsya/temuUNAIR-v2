---
id: REV-TMU-FE-004
task: TMU-FE-004
title: "Report wizard steps 3–5 + review/submit with hint and custody fields (SCR-004)"
reviewer: reviewer
verdict: APPROVE
cycle: 2
date: 2026-10-05
---

# Review — TMU-FE-004 (cycle 2)

**Scope**: `git diff origin/main...HEAD` on branch `agent/fe/TMU-FE-004-fe-wizard-submit`.
Reviewed against FE-05, SCR-004, FR-REP-003, FR-REP-004, ADR-0007, API-REP-01, `WF-REVIEW`, and `05-definition-of-ready-done.md`.

## Summary

In cycle 2, the implementation of steps 3–5 (Details, Location & Time, Custody, Verification Hints, and Review/Submit) for the report wizard was re-evaluated against the 4 MAJOR and 3 MINOR findings from cycle 1.

All 4 MAJOR findings have been cleanly resolved:
1. **MAJOR 1 (Submit replay & 409 conflict recovery)**: Resolved. In `report-wizard.tsx:280-285`, receiving a 409 status triggers `persistDraft()` so the user's form progress in localStorage is preserved rather than dropped, and displays the localized `error.IDEMPOTENCY_CONFLICT` message. Submit replay (receiving 201 with replayed report ID) is verified and routes to the report detail page.
2. **MAJOR 2 (Idempotency key rotation on payload modification)**: Resolved. In `report-wizard.tsx:266-270`, `serializedPayload` is compared with `lastPayloadRef.current`. If the form payload changes, a new `crypto.randomUUID()` is generated; if identical, the key is reused across retries.
3. **MAJOR 3 (FE-11 error code display & Indonesian fallback)**: Resolved. In `report-wizard.tsx:280-290`, errors are caught as `ApiQueryError` and mapped via `t.has("error." + err.message) ? t("error." + err.message) : t("error.INTERNAL")`. The hardcoded Indonesian string fallback was replaced with `t("error.INTERNAL")`.
4. **MAJOR 4 (Hardcoded Indonesian copy, date format, and color chips)**: Resolved. In `review-step.tsx`, hardcoded copy was replaced with i18n keys (`photosCount`, `colorsLabel`, `brandLabel`, `locationNoteLabel`, `timeLabel`, `timeRangeSeparator`). Date formatting now uses `Intl.DateTimeFormat(locale, ...)`. Color chips in `details-step.tsx` are now tokenized (`BLACK`, `WHITE`, `BLUE`, etc.) and translated via `report.wizard.colors.*`. All keys are present in both `en.json` and `id.json`.

Cycle 1 minor findings resolved:
- Emojis removed from `custody-step.tsx` and `hints-step.tsx`.
- Contract parity tests updated to assert explicit boolean outcomes across all draft samples.
- Replaced `any` in test fixtures with `Record<string, unknown>`.

Verdict: **APPROVE** (cycle 2 of 2).

---

## BLOCKER

*(None)*

---

## MAJOR

*(None)*

---

## MINOR

*(None)*

---

## Cycle 1 Resolution Verification

| # | Finding | Cycle 1 Severity | Cycle 2 Status | Evidence / Notes |
|---|---|---|---|---|
| 1 | Submit replay & 409 conflict recovery unhandled | MAJOR | **RESOLVED** | `report-wizard.tsx:281-284` preserves draft via `persistDraft()` on 409; tested in `report-wizard.test.tsx:283-323`. |
| 2 | Idempotency-Key not rotated when payload changes | MAJOR | **RESOLVED** | `report-wizard.tsx:266-270` tracks `lastPayloadRef` and rotates UUID on change; reuses UUID if payload is identical. |
| 3 | FE-11 violation: raw error codes rendered | MAJOR | **RESOLVED** | `report-wizard.tsx:280-290` maps `error.<code>` via i18n with fallback `error.INTERNAL`; tested for 422 and 409. |
| 4 | Hardcoded Indonesian strings, dates, and color chips | MAJOR | **RESOLVED** | `review-step.tsx` uses i18n keys and `Intl.DateTimeFormat(locale)`; `details-step.tsx` uses color tokens translated via `report.wizard.colors.*`. |
| 5 | Parity tests omit steps 3-6 fields | MINOR | **RESOLVED** | Explicit boolean expectations added in `contract-parity.test.ts`. |
| 6 | Use of `any` in test fixtures | MINOR | **RESOLVED** | Replaced with `Record<string, unknown>` in `report-wizard.test.tsx`. |
| 7 | Unrequested emojis in JSX | MINOR | **RESOLVED** | Emojis removed from `custody-step.tsx` and `hints-step.tsx`. |

---

## Detailed Check Matrix

| # | Requirement | Status | Evidence / Notes |
|---|---|---|---|
| 1 | Red evidence existed first and failed correctly | **PASS** | `TMU-FE-004.md:61,68` records Step 4 RED (17 failures in `wizard-steps.test.ts`, 1 in `draft.test.ts`). |
| 2 | All new/updated tests pass | **PASS** | 16 test files / 118 tests pass under `apps/web/src/{features,components}/report` and `apps/web/src/app/(app)/reports`. |
| 3 | Contract verification | **PASS** | `pnpm test:contract` executes 866 Schemathesis contract tests against `BE-02-openapi.yaml` with 0 failures. |
| 4 | Privacy rules (ADR-0007 / FE-04) | **PASS** | Hint answers stripped in `draft.ts`; masked with `type="password"`; omitted from `review-step.tsx`. |
| 5 | A11y & UI standards (axe, keyboard, touch targets) | **PASS** | Zero axe violations across all component tests; interactive targets `min-h-11` (≥44px); keyboard operable. |
| 6 | i18n parity (`id` and `en`) | **PASS** | `messages.test.ts` passed (5/5 tests); all keys present in both `id.json` and `en.json`. |
| 7 | Lane discipline (`.agent/lanes.json`) | **PASS** | All modified files belong to `fe` or `_common`. |

---

## Verdict

**APPROVE**
