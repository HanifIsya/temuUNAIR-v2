---
id: REV-TMU-DOC-015
task: TMU-DOC-015
title: "Review and approve the component inventory and content/microcopy docs"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DOC-015 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/docs/TMU-DOC-015-review-components-copy`.
Files reviewed: `08-component-inventory.md`, `09-content-and-microcopy.md`, `tasks/TMU-DOC-015.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
Both `08-component-inventory.md` and `09-content-and-microcopy.md` have been audited against their
Blueprint §4 rows, verified for cross-document consistency with screen specs and error catalogs,
and advanced to `status: approved`. Every UI component specifies props, emits, variants, and states.
Every microcopy string is provided in natural Bahasa Indonesia with an accurate English mirror.

## Blueprint §4 Specification Audit

### 1. `docs/02-design/08-component-inventory.md`

Blueprint §4 requirements: *`CMP-###` list with variants and states (source for FE-03 §5B.3)*

| Section | Status | Verification Detail |
|---|---|---|
| Layout & Shell | PASS | CMP-001 (`AppShell`), 002 (`NotificationBell`), 003 (`LocaleSwitcher`), 027 (`EmptyState`), 027b (`ErrorState`), 028 (`Skeletons`), 029 (`ConfirmDialog`), 031 (`SafetyTipBanner`), 036 (`ToastProvider`). |
| Reporting | PASS | CMP-004 (`ReportCard`), 005 (`ReportGrid`), 006 (`ReportFilterBar`), 007 (`StatusBadge`), 008 (`StatusStepper`), 009 (`WizardShell`), 010 (`CategoryPicker`), 011 (`PhotoUploader`), 012 (`ImageGallery`), 013 (`LocationPicker`), 014 (`DateTimeRangePicker`), 015 (`VerificationHintsEditor`), 016 (`SensitiveNotice`), 030 (`FlagDialog`). |
| Matching | PASS | CMP-017 (`MatchCard`), 018 (`MatchBandBadge` / `ReasonChips`). |
| Claims & Return | PASS | CMP-019 (`ChallengeForm`), 020 (`ClaimCard`), 021 (`AnswerCompare`), 022 (`ClaimTimeline`), 023 (`ChatThread`), 024 (`ChatComposer`), 025 (`HandoverPanel`), 026 (`NotificationItem`), 032 (`DropPointCard`). |
| Admin | PASS | CMP-033 (`AdminTable`), 034 (`ModerationDrawer`), 035 (`StatCard`). |
| Rules & Conventions | PASS | Enforces contract typing, design token usage, no nested interactive elements, and accessible names. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

### 2. `docs/02-design/09-content-and-microcopy.md`

Blueprint §4 requirements: *All id-ID strings, tone, error messages, safety tips, empty states, with an English mirror*

| Section | Status | Verification Detail |
|---|---|---|
| Voice principles | §Voice principles | PASS | 5 explicit tone rules: plain language, calm in errors, honest about AI, privacy-forward, safety. |
| Global strings | §Global strings | PASS | Common UI actions (`common.save`, `cancel`, `retry`, `offline`, etc.) in `id` and `en`. |
| Wizard copy | §Report wizard | PASS | Step headers, helper text, sensitive warnings, and duplicate hints. |
| Browse & detail | §Browse and detail | PASS | Search placeholders, empty states, masked badges, and custody strings. |
| Matches | §Matches | PASS | Bands (`STRONG`, `POSSIBLE`) and all explainable reason keys. |
| Claims & chat | §Claims, chat, handover | PASS | Challenge instructions, decision buttons, handover tips, and composer hints. |
| Notifications | §Notifications | PASS | Title and body strings for all notification types. |
| Error catalog | §Error messages | PASS | One-to-one mapping for every `BE-04` error code (`error.<code>`) in friendly Indonesian and English. |
| Safety & empty states | §Safety & §Empty | PASS | Campus handover safety guidelines and contextual empty states across views. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (Section Completeness):** All required sections per Blueprint §4 are present in both documents.
- [x] **AC 2 (Variants, States & Dual-Locale):** Every CMP-### has variants and states; every copy string has an Indonesian version and an English mirror.
- [x] **AC 3 (Findings Fixed):** Clean audit; both files updated.
- [x] **AC 4 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set on both docs.
- [x] **AC 5 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
