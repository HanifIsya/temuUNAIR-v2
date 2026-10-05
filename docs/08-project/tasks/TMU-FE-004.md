---
id: TMU-FE-004
title: Report wizard steps 3–5 + review/submit with hint and custody fields (SCR-004)
status: DONE
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

- [x] Cross-field rules from the contract schema gate each step; hint answer inputs are `type=password`-safe and cleared after submit.
- [x] Submit success/failure/replay paths tested with MSW (409 conflict → existing draft).
- [x] No hint answer, email, or raw URL appears in logs or client state (privacy check).
- [x] Red tests first; `pnpm gate` green.

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

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-05 | frontend-dev | 1 PICK | branch `agent/fe/TMU-FE-004-fe-wizard-submit` from `origin/main` (`c97205c`) |
| 2026-10-05 | frontend-dev | 3 PLAN | 1) fix n-10/n-13 in photo-uploader; 2) schemas for steps 3-6 + draft privacy (no hint answers in localStorage); 3) metadata hooks (campuses, locations, drop-points) + useCreateReport mutation with Idempotency-Key; 4) step components (Details, Location/Time, Custody, Hints, Review); 5) i18n keys id/en; 6) red tests first for validation, a11y, privacy, and submit; 7) green + gate |
| 2026-10-05 | qa-engineer | 4 RED | `pnpm test:unit apps/web/src/features/report/wizard-steps.test.ts` → 17 failed (canProceedStep3..6 unimplemented); `pnpm test:unit apps/web/src/features/report/draft.test.ts` → 1 failed (expected localStorage not to contain secret hint answer 'KUNING_RAHASIA') |
| 2026-10-05 | frontend-dev | 5 GREEN | implemented steps 3–6 in `report-wizard.tsx`, `DetailsStep`, `LocationStep`, `CustodyStep`, `HintsStep`, `ReviewStep`; metadata & mutation hooks; privacy check sanitization in `draft.ts`; fixed n-10 and n-13 in `photo-uploader` |
| 2026-10-05 | frontend-dev | 6 REFACTOR | added 50 i18n keys across `id.json` and `en.json` (197 keys total); component tests for all steps with axe and keyboard coverage |
| 2026-10-05 | frontend-dev | 7 GATE | `pnpm gate` (quick) → `OK gate(quick) passed`, exit 0 (80 test files / 635 unit tests passed, contracts 1.1.0, db:check ok, ml 7/7) |
| 2026-10-05 | frontend-dev | 8 COMMIT/PUSH | commit `d4d1b0b`, draft PR [#49](https://github.com/HanifIsya/temuUNAIR-v2/pull/49) opened |
| 2026-10-05 | reviewer | 9 REVIEW c1 | adversarial reviewer: CHANGES (4 MAJOR: 409/replay handling, Idempotency-Key rotation, FE-11 error mapping, hardcoded strings/color tokens) |
| 2026-10-05 | frontend-dev | 5 GREEN c2 | resolved all 4 MAJORs: persistDraft on 409, rotate UUID on payload diff, map error.<code> via i18n, tokenize colors and translate ReviewStep copy; cycle 2 tests pass (118 tests in area) |
| 2026-10-05 | reviewer | 9 REVIEW c2 | adversarial reviewer: **APPROVE** (cycle 2 of 2); recorded in `docs/08-project/reviews/TMU-FE-004.md` |
| 2026-10-05 | frontend-dev | 10 SHIP | PR #49 refreshed and marked ready for review |
| 2026-10-05 | frontend-dev | 11 CI | 10 required checks pass (`unit`, `e2e`, `integration`, `build`, `lint-typecheck`, `contracts`, `contract-fuzz`, `ml`, `migrations`, `secret-scan`) |
| 2026-10-05 | frontend-dev | 12 MERGE | PR #49 squash-merged to `origin/main` |
| 2026-10-05 | frontend-dev | 13 POST-MERGE | task flipped to DONE, backlog/status regenerated, branch deleted |

## Evidence

- **Red tests**: Step 4 RED captured in progress log (17 failures in `wizard-steps.test.ts`, 1 failure in `draft.test.ts`).
- **Gate**: Full `pnpm gate` (quick) green (`OK gate(quick) passed`, 635 unit tests, contracts 1.1.0, db:check ok, ml 7/7).
- **Parity**: `contract-parity.test.ts` asserts `wizardFormSchema`, `draftDataSchema`, `categoryMetaSchema` match contract schemas.
- **Privacy**: `draft.test.ts` and `report-wizard.test.tsx` verify secret hint answers never persist in `localStorage` and never render on the review screen.
- **A11y**: Zero axe violations across all 5 new step components and full wizard page; minimum 44px touch targets on all interactive controls; keyboard operable.
- **Inherited fixes**: n-10 (`input.click()` spy on Enter) and n-13 (`aria-hidden="true"` on sr-only file input) verified.
- **i18n**: 213 keys per locale in sync (`pnpm i18n:check` passed).
- **Review**: Cycle 2 verdict **APPROVE** in `docs/08-project/reviews/TMU-FE-004.md`.
- **PR**: [#49](https://github.com/HanifIsya/temuUNAIR-v2/pull/49).

## Definition of Done

See `docs/05-workflow/05-definition-of-ready-done.md`. Evidence above; review verdict in
`docs/08-project/reviews/TMU-FE-004.md`.
