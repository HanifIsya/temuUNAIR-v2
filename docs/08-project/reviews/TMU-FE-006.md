---
id: REV-TMU-FE-006
task: TMU-FE-006
title: "Home dashboard — my-reports summary, CTAs, seed demo pass (SCR-003)"
reviewer: reviewer
verdict: APPROVE
cycle: 3
date: 2026-10-10
---

# Review — TMU-FE-006 (cycle 3 re-check)

**Scope**: `git diff main` / `git diff origin/main...HEAD` on branch `agent/fe/TMU-FE-006-fe-home-dashboard`.
Reviewed against Definition of Done (`docs/05-workflow/05-definition-of-ready-done.md`), frontend contracts (`FE-01`, `FE-02`, `FE-03`, `FE-04`, `FE-06`, `FE-07`, `FE-08`, `FE-09`, `FE-11`, `FE-12`), screen spec (`SCR-003`), state machine rules, privacy rules, accessibility guidelines (WCAG 2.2 AA), lane rules, and `docs/05-workflow/06-code-review-checklist.md`.

Verdict: **APPROVE**.

---

## Summary

All 3 MAJOR findings and MINOR items identified during Cycle 2 have been fully resolved:
1. `apps/web/src/features/home/home-view.test.tsx` now comprehensively tests `FE-06` UI states:
   - Loading skeletons (`home-reports-loading`, line 131)
   - Renewal failure error alert (`role="alert"`, line 169)
   - Empty matches state (`home-matches-empty`, line 209)
2. `apps/web/src/components/report/match-card.tsx` conforms to CMP-017 and accessibility contract `FE-09`:
   - `onClaim` prop added to `MatchCardProps` (line 59) and rendered with `data-testid="match-claim-${match.id}"` (line 159).
   - Dismiss button `aria-label` incorporates the item title (`t("match.dismissItem", { title: other.title })`, line 177) resolving WCAG 2.4.4 / 4.1.2.
   - `match-card.test.tsx` covers both `onDismiss` and `onClaim` interactions (lines 65–80).
   - Default testid parameterization is decoupled from `/home` to `match-card-${match.id}` (line 83).
3. Project bookkeeping files (`backlog.md` and `status.md`) are synchronized:
   - `TMU-FE-006` is properly registered with `status: IN_PROGRESS` in `docs/08-project/backlog.md:96`.
   - `docs/08-project/status.md:89,113` accurately reflects M3 counts (`TODO: 5 · IN_PROGRESS: 1 · BLOCKED: 0 · REVIEW: 0 · DONE: 25 · CANCELLED: 0`) and unchecked item `[ ] TMU-FE-006`.
4. Minor styling items:
   - Unthemed `rounded` utilities replaced with design token utility `rounded-md` in `home-view.tsx:175,350`.

---

## Evaluation of Cycle 2 Findings

1. **MAJOR 1 (`home-view.test.tsx` FE-06 UI states)**: **RESOLVED**.
   - `home-view.test.tsx:131-134` asserts loading skeleton `home-reports-loading`.
   - `home-view.test.tsx:169-194` asserts renewal failure alert rendering inside `role="alert"`.
   - `home-view.test.tsx:209-216` asserts empty matches state `home-matches-empty`.

2. **MAJOR 2 (`match-card.tsx` CMP-017 contract drift & accessible name)**: **RESOLVED**.
   - `MatchCardProps` in `match-card.tsx:59` includes optional `onClaim?: (matchId: string) => void`.
   - `match-card.tsx:156-168` renders claim button when `onClaim` is provided.
   - `match-card.tsx:177` sets `aria-label={t("match.dismissItem", { title: other.title })}` (`"Abaikan kecocokan {title}"` in ID / `"Dismiss match for {title}"` in EN).
   - `match-card.test.tsx:65-80` tests both `onDismiss` and `onClaim` invocations and verifies the accessible label includes the item title.

3. **MAJOR 3 (Backlog and status synchronization)**: **RESOLVED**.
   - Task status in `TMU-FE-006.md:4` is `IN_PROGRESS`.
   - `backlog.md:96` and `status.md:89,113` are consistent with the current task state (`IN_PROGRESS`), eliminating premature `DONE` reporting.

4. **MINOR findings**: **RESOLVED**.
   - `home-view.tsx:175,350`: Unthemed `rounded` replaced with token-compliant `rounded-md`.
   - `match-card.tsx:83`: Default testId changed to generic `match-card-${match.id}`.

---

## BLOCKER

*(None)*

---

## MAJOR

*(None)*

---

## MINOR

- [ ] `apps/web/src/app/(app)/home/page.tsx:6` — **Duplicate Uncached `getAppUser()` Call**
  - **Note**: `HomePage` calls `await getAppUser()`, which queries the database for the user profile, while `layout.tsx:9` also calls `getAppUser()` in the same request tree. Non-blocking; can be wrapped with React `cache()` in a general shell optimization task.

---

## Checks run

- Lane check: Verified all touched and untracked files are within `fe` or `_common` lanes.
- Contract fidelity:
  - `API-REP-03` (`/api/v1/reports/mine`) and `API-MAT-01` (`/api/v1/reports/{id}/matches`) queries adhere to `FE-02` and `FE-04` query keys and 30s `staleTime`.
  - `API-NTF-04` unread notification polling correctly configured with 30s interval.
  - `MatchCard` (CMP-017) and `MatchBandBadge` (CMP-018) conform to `FE-03`.
- Unit tests & axe:
  - `pnpm test:unit "apps/web/src/features/home" "apps/web/src/components/report/match-card" "apps/web/src/app/(app)/home" "apps/web/src/i18n/messages.test.ts"` → 4 test files, 20 passed.
  - Zero axe accessibility violations in `HomeView`, `MatchCard`, and `HomePage`.
- Privacy rules:
  - No sensitive fields (emails, embeddings, raw similarity scores) are leaked or rendered.
  - Sensitive items maintain blurred thumbnail display with sensitive notice chip.
- i18n keys:
  - Parity verified across `apps/web/src/i18n/messages/id.json` and `en.json` (including new `home` and `match` keys).

---

## Notes for the human

All blocking and major review findings across Cycles 1 and 2 are fully resolved. Task TMU-FE-006 satisfies the Definition of Done and frontend contracts.

Recommended next steps:
1. Stage and commit untracked and modified files.
2. Advance task status to `DONE` upon merge gate (Step 12).
