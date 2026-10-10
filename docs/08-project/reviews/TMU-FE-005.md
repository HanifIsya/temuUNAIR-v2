---
id: REV-TMU-FE-005
task: TMU-FE-005
title: "Browse list + report detail via generated client (SCR-005/006)"
reviewer: reviewer
verdict: APPROVE
cycle: 2
date: 2026-10-10
---

# Review — TMU-FE-005 (cycle 2)

**Scope**: `git diff origin/main...HEAD` and working tree changes on branch `agent/fe/TMU-FE-005-fe-browse-detail`.
Reviewed against DoD (`docs/05-workflow/05-definition-of-ready-done.md`), frontend contracts (`FE-01`, `FE-02`, `FE-03`, `FE-04`, `FE-06`, `FE-07`, `FE-08`, `FE-09`, `FE-11`, `FE-12`), screen specs (`SCR-005`, `SCR-006`), privacy rules, accessibility guidelines, lane rules, and `docs/05-workflow/06-code-review-checklist.md`.

---

## Summary

In cycle 2, the implementation of browse list (`/reports` and `/browse`), report card, status badge, report grid, filter bar, and report detail (`/reports/[id]`) views was re-evaluated against all 2 BLOCKERs and 7 MAJOR findings documented in cycle 1.

All findings from cycle 1 have been completely resolved:
1. **BLOCKER 1 (SSR first-paint data fetching in /reports/[id]/page.tsx)**: Resolved. In `apps/web/src/features/report/server-report.ts:7-28`, `getServerReport(id)` performs server-side data fetching using incoming cookies. In `apps/web/src/app/(app)/reports/[id]/page.tsx:15-22`, missing reports trigger Next.js `notFound()`, while existing reports pass `initialData` to `<ReportDetailView reportId={id} initialData={initialData} />`, ensuring first-paint hydration without skeleton flash (`FE-01`, `FE-02`).
2. **BLOCKER 2 (Search input accessibility in browse-view.tsx)**: Resolved. In `apps/web/src/features/browse/browse-view.tsx:178-189`, the search `<input>` is properly labelled with `<label htmlFor="browse-search-input" className="sr-only">{t("search.placeholder")}</label>` and `aria-label={t("search.placeholder")}` (`FE-09`, WCAG 2.2 AA).
3. **MAJOR 3 (URL state synchronization for browse in browse-view.tsx)**: Resolved. In `apps/web/src/features/browse/browse-view.tsx:27-47, 73-89`, filter changes and search queries update URL search parameters via `router.replace` with `URLSearchParams`, and initial filters parse from `useSearchParams()` (`FE-01`, `SCR-005`).
4. **MAJOR 4 (Calling notFound() for missing/hidden reports)**: Resolved. Missing or hidden reports invoke Next.js `notFound()` both on the server in `apps/web/src/app/(app)/reports/[id]/page.tsx:17` and on the client in `apps/web/src/features/report/report-detail-view.tsx:67`, eliminating the ad-hoc inline div (`FE-01`, `FE-04`, `FE-06`, `FE-11`).
5. **MAJOR 5 (Hardcoded Indonesian locale and missing Jakarta timezone)**: Resolved. In `apps/web/src/features/report/report-detail-view.tsx:37, 47-56`, `formatDate` utilizes `useLocale()` and `new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "Asia/Jakarta" })` for both `occurredAt.from` and `expiresAt` (`FE-08` Rule 5).
6. **MAJOR 6 (Raw enum literals rendered as display text)**: Resolved. Campus enum strings are mapped to user-friendly titles via `formatCampusName(report.campus)` (`apps/web/src/features/browse/campus.ts:1-13`) in `ReportCard` and `ReportDetailView`. Status and category enums map through i18n message keys (`FE-08` Rule 6).
7. **MAJOR 7 (Missing requestId in ErrorState and incorrect error title)**: Resolved. `ApiQueryError` in `apps/web/src/lib/api/client.ts:5-15` extracts and stores `X-Request-Id`. Both `browse-view.tsx:114-123` and `report-detail-view.tsx:70-79` pass `requestId` into `<ErrorState />` and use `titleKey="common.unknownError"` with `descKey="error.INTERNAL"` (`FE-04`, `FE-06`, `FE-11`).
8. **MAJOR 8 (List semantics and aria-busy in ReportGrid)**: Resolved. In `apps/web/src/components/report/report-grid.tsx:21-29, 66-74`, `ReportGrid` and `ReportGridSkeleton` specify `role="list"` with items in `role="listitem"`, and dynamic loading states set `aria-busy` (`FE-09` CMP-005).
9. **MAJOR 9 (Design token violations)**: Resolved. Unthemed Tailwind palette classes (`bg-emerald-50`, `bg-red-50`) and arbitrary pixel brackets (`blur-[2px]`, `text-[11px]`, `text-[10px]`, `max-w-[120px]`) were replaced with tokens (`bg-success-600/10`, `bg-danger-600/10`, `blur-xs`, `text-xs`, `max-w-32`) conforming to `apps/web/src/styles/theme.css` (`FE-07`).

Verdict: **APPROVE** (cycle 2 of 2).

---

## BLOCKER

*(None)*

---

## MAJOR

*(None)*

---

## MINOR

- [ ] `apps/web/src/features/report/report-detail-view.tsx:310-316` — **Inert Flag Button (M6 Scope)**.
  - **Issue**: The flag button (`data-testid="report-flag-button"`) currently has no `onClick` handler. Flagging functionality (`FlagDialog` CMP 030) belongs to the moderation and claim workflows scheduled in M6.
  - **Recommendation**: Track as a backlog follow-up when implementing M6 claim/moderation workflows.

- [ ] `apps/web/src/components/report/report-filter-bar.tsx:66-156` — **Time, Custody, and Sort Controls Omitted from Filter Bar**.
  - **Issue**: `useReportsList` accepts `dateFrom`, `dateTo`, and `custody` parameters, but `ReportFilterBar` only presents controls for Type, Campus, and Category.
  - **Recommendation**: File a follow-up task to add additional filter chips and sort ordering once specified in the backlog.

- [ ] `apps/web/src/features/browse/use-reports-list.ts:37` & `apps/web/src/features/report/use-report-detail.ts:27` — **Type Casts on Generated Client Calls**.
  - **Issue**: The generated contract client types for `API-REP-02` lack query parameter definitions in `packages/contracts/src/registry.ts`, requiring `as never` type casts.
  - **Recommendation**: Track in a future `TMU-CTR` task to provide explicit query parameter schemas in the contract registry.

---

## Cycle 1 Resolution Verification

| # | Finding | Cycle 1 Severity | Cycle 2 Status | Evidence / Notes |
|---|---|---|---|---|
| 1 | Missing SSR first-paint data fetching in `/reports/[id]/page.tsx` | BLOCKER | **RESOLVED** | `server-report.ts:7-28` & `reports/[id]/page.tsx:15-22` fetch report server-side with cookie propagation and pass `initialData` into `ReportDetailView`. Tested in `reports/[id]/page.test.tsx:49-71`. |
| 2 | Missing accessible label on search input | BLOCKER | **RESOLVED** | `browse-view.tsx:178-189` adds accessible `<label htmlFor="browse-search-input" className="sr-only">` and `aria-label`. Axe check passes in `browse-view.test.tsx:136-143`. |
| 3 | No URL synchronization for browse filter state | MAJOR | **RESOLVED** | `browse-view.tsx:27-47, 73-89` parses from `useSearchParams()` and synchronizes changes using `router.replace` with `URLSearchParams`. Tested in `browse-view.test.tsx:123-134`. |
| 4 | Bypassing app `notFound()` for missing/hidden reports | MAJOR | **RESOLVED** | `reports/[id]/page.tsx:17` and `report-detail-view.tsx:67` invoke Next.js `notFound()` on 404. Inline ad-hoc div removed. Tested in `report-detail-view.test.tsx:127-137`. |
| 5 | Hardcoded Indonesian locale and missing Jakarta timezone | MAJOR | **RESOLVED** | `report-detail-view.tsx:37, 47-56` formats dates via `Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "Asia/Jakarta" })`. |
| 6 | Raw enum literals rendered as display text | MAJOR | **RESOLVED** | `campus.ts:1-13` formats campus enums (`formatCampusName`). Statuses and categories mapped via localized translations. |
| 7 | Missing request ID and incorrect error title in `ErrorState` | MAJOR | **RESOLVED** | `ApiQueryError` captures `X-Request-Id`; `browse-view.tsx:114-123` and `report-detail-view.tsx:70-79` pass `requestId` and display `common.unknownError`. |
| 8 | Missing list semantics and `aria-busy` in `ReportGrid` | MAJOR | **RESOLVED** | `report-grid.tsx:21-29, 66-74` sets `role="list"` and `role="listitem"`, and applies `aria-busy` during skeleton and next-page fetching. |
| 9 | Design token violations | MAJOR | **RESOLVED** | Unthemed classes and arbitrary pixel brackets replaced with theme tokens (`bg-success-600/10`, `bg-danger-600/10`, `text-xs`, `max-w-32`, `blur-xs`). |

---

## Detailed Check Matrix

| # | Requirement | Status | Evidence / Notes |
|---|---|---|---|
| 1 | Red tests existed first and failed correctly | **PASS** | Recorded in `TMU-FE-005.md:46` Step 4 RED (`status-badge.test.tsx`, `report-card.test.tsx`, `browse-view.test.tsx`, `report-detail-view.test.tsx`). |
| 2 | All new/updated tests pass | **PASS** | 22 test files / 138 unit tests pass for browse and report components and pages. |
| 3 | Contract fidelity (`API-REP-02`, `API-REP-04`) | **PASS** | Generated client used throughout; keyset pagination cursor implemented; query keys match `FE-04` (`reportsListKey`, `reportsDetailKey`). |
| 4 | Privacy rules (sensitive masking, hint answers, PII) | **PASS** | Hint answers never rendered; hint verification prompts restricted to owner view; sensitive photos masked with blur and notice. |
| 5 | Accessibility standards (axe, labels, semantics) | **PASS** | Zero axe violations across all 5 test suites (`report-card`, `status-badge`, `browse-view`, `report-detail-view`, `reports/[id]/page`). Search input labelled; grid semantics applied. |
| 6 | i18n parity (`id` and `en`) | **PASS** | `apps/web/src/i18n/messages.test.ts` passes (5/5 tests); keys identical between `id.json` and `en.json`. |
| 7 | Lane discipline (`.agent/lanes.json`) | **PASS** | All modified files belong strictly to `fe` and `_common` lanes. |

---

## Checks run

- Unit tests: `pnpm test:unit "apps/web/src/features/browse" "apps/web/src/features/report" "apps/web/src/components/report" "apps/web/src/app/(app)/reports"` → 22 test files / 138 tests passed cleanly.
- i18n parity: `pnpm test:unit apps/web/src/i18n/messages.test.ts` → 5/5 tests passed (identical key set, identical ICU placeholders, Indonesian source).
- A11y tests: axe assertions evaluated across all 5 component/page test files (`report-card.test.tsx`, `status-badge.test.tsx`, `browse-view.test.tsx`, `report-detail-view.test.tsx`, `page.test.tsx`) → 0 axe violations.
- Privacy & security: Confirmed no private fields (emails, embeddings, hint answers) leaked into responses or UI components.
- Lane check: `git status -s` verified all modified and untracked files are strictly within `fe` (`apps/web/**`) and `_common` (`docs/**`).

---

## Notes for the human

All blocking and major issues identified during cycle 1 have been resolved in full compliance with the architecture blueprint, frontend contracts (`FE-01` through `FE-11`), screen specifications (`SCR-005`, `SCR-006`), and WCAG 2.2 AA accessibility requirements. The task is ready to be committed and merged.

---

## Verdict

**APPROVE**
