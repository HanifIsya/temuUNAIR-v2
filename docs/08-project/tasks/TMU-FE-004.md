---
id: TMU-FE-004
title: Report wizard steps 3–5 + review/submit with hint and custody fields (SCR-004)
status: TODO
lane: fe
slug: fe-wizard-submit
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-FE-003]
refs: [FE-05, SCR-004, FR-REP-003, FR-REP-004, ADR-0007, API-REP-01]
created: 2026-10-03
updated: 2026-10-05
---

# TMU-FE-004 — Report wizard steps 3–5 + review/submit with hint and custody fields (SCR-004)

## Goal

Finish the wizard per FE-05: step 3 details (title, description, brand, colors — the fields
the FTS trigger indexes), step 4 location + lost/found time (within the 180-day window,
`VALIDATION_FAILED` mapped per FE-11), step 5 FOUND-only `custody` and ≥1 (≥2 when
sensitive) verification hints — the answers are write-only and never re-displayed
(ADR-0007 privacy rule). Review screen posts `ReportCreate` with `Idempotency-Key` and
redirects to the new report detail.

## Acceptance criteria

- [ ] Cross-field rules from the contract schema gate each step; hint answer inputs are `type=password`-safe and cleared after submit.
- [ ] Submit success/failure/replay paths tested with MSW (409 conflict → existing draft).
- [ ] No hint answer, email, or raw URL appears in logs or client state (privacy check).
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/(app)/reports/**` (steps 3–5, review), `apps/web/src/features/report/**`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-004.md`

## Inherited from TMU-FE-003 review (cycle 2 MINORs, filed per DoD)

- **n-10** — `components/report/photo-uploader.test.tsx:193-201`: the keyboard test after
  `{Enter}` asserts the always-present file input exists instead of proving the button
  *opens the picker* (vacuous; `onClick` could be removed and it would still pass).
  Fix: spy on `input.click()`/`onChange`, or `user.upload` after Enter.
- **n-13** — `components/report/photo-uploader.tsx:56-69`: the sr-only file input's
  `aria-label` duplicates the visible button's accessible name (axe is green, input is
  `tabIndex={-1}`; a virtual cursor meets two controls with the same name). Fold into this
  task's a11y pass: drop the `aria-label` or hide the inert input from the a11y tree, then
  re-verify axe.
- (Also inherited from cycle 1 via TMU-FE-003 Deferrals: RATE_LIMITED toast n-3, leave-guard
  n-4, generated MSW shapes n-6, systemic ≥44 px targets n-7 — see
  `tasks/TMU-FE-003.md` § Deferrals; FE-03 prop/event shapes O-6.)
