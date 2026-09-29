---
id: FE-09
title: Accessibility contract
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["A11Y", "FE-03"]
source_refs: ["Blueprint §5B.8", "NFR-040..043"]
---

# FE-09 — Accessibility contract (WCAG 2.2 AA)

Per-component requirements. Zero axe violations is a merge gate for component tasks; the full
audit is M8 (`docs/06-quality/08-accessibility-audit.md`).

## Global requirements

| # | Requirement |
|---|---|
| 1 | `<html lang>` matches the active locale |
| 2 | One `<h1>` per page; heading levels never skipped |
| 3 | Skip-link to `#main` as the first focusable element in `AppShell` |
| 4 | Visible focus indicator on every interactive element (never `outline:none` without replacement) |
| 5 | Touch targets ≥ 44×44 px with ≥ 8 px spacing |
| 6 | Status never conveyed by colour alone (icon + text) |
| 7 | Yellow is accent/background only; dark text on yellow; never yellow text on white |
| 8 | `prefers-reduced-motion` honoured (`11-responsive-and-motion.md`) |
| 9 | All images have `alt` from the item title; masked images use "Foto disamarkan"; decorative images `alt=""` |
| 10 | Keyboard path for every flow, including photo upload and location selection |

## Component requirements

| CMP | Requirement |
|---|---|
| `AppShell` | landmarks (`header/nav/main/footer`), skip-link, bottom nav has `aria-label="Navigasi utama"` |
| `NotificationBell` | button with `aria-label` including the unread count; count changes announced politely |
| `LocaleSwitcher` | labelled select/buttons; change announced |
| `ReportCard` | **one** link (no nested interactive); masked badge has text; status badge icon + text |
| `ReportGrid` | list semantics; "Muat lebih banyak" is a real button; loading state has `aria-busy` |
| `ReportFilterBar` | chips are toggle buttons with `aria-pressed`; sheets trap focus and restore it |
| `StatusBadge` | icon + text; never colour-only |
| `StatusStepper` | `aria-current="step"`; steps are an ordered list with labels |
| `WizardShell` | focus moves to the step heading on change; step count announced ("Langkah 3 dari 5") |
| `CategoryPicker` | radio-group semantics or listbox with keyboard arrow navigation; selected announced |
| `PhotoUploader` | real `<button>` opens the picker (keyboard-operable); progress announced; rejection reason linked; errors announced |
| `ImageGallery` | masked images not zoomable and not downloadable; images have alt |
| `LocationPicker` | labelled comboboxes; "pilih dari daftar" alternative to the map pin |
| `DateTimeRangePicker` | labelled date/time inputs with format hints; quick chips are buttons |
| `VerificationHintsEditor` | each prompt/answer pair is a labelled group; add/remove buttons announce their target |
| `SensitiveNotice` | `role="note"`; text explains masking |
| `MatchCard` | one primary link; dismiss/claim buttons have distinct accessible names including the item name; band icon + text |
| `ChallengeForm` | each input labelled by the prompt text; helper text linked; remaining attempts announced |
| `ClaimCard` | status icon + text; unread indicator has a text alternative |
| `AnswerCompare` | pairs announced as a list with explicit "Jawaban yang diharapkan" / "Jawaban pengklaim" labels |
| `ClaimTimeline` | ordered list with dates in accessible format |
| `ChatThread` | `aria-live="polite"`; day separators are headings; new messages do not steal focus |
| `ChatComposer` | labelled textarea; Enter sends, Shift+Enter newline; disabled state explained |
| `HandoverPanel` | confirmation buttons state who confirmed; waiting state announced politely |
| `NotificationItem` | relative time has an absolute accessible value; unread dot has text |
| `EmptyState`/`ErrorState` | focus moves to the heading on mount; retry is a button; requestId copyable and announced |
| `ConfirmDialog` | focus trap, ESC closes, focus restored, `aria-describedby` on the body |
| `FlagDialog` | reasons as radio group; note optional with a label |
| `AdminTable` | caption, `<th scope>`, sort buttons announce direction, rows openable by keyboard |
| `ModerationDrawer` | focus trap; "Tampilkan jawaban" disclosure with a warning; focus returns to the row |
| `StatCard` | definition-list semantics; delta has sign + text |
| `ToastProvider` | toasts are `role="status"` (success) / `role="alert"` (error); errors keep requestId copyable |

## Forms

- Every input has a visible label; placeholders are never the only label.
- Errors are linked with `aria-describedby` and announced; the summary alert links to the first
  invalid field.
- Required fields marked in text (not with a red asterisk only).

## Verification

| Layer | Tool | Gate |
|---|---|---|
| Component | Vitest + jest-axe | zero violations per component test |
| Page | Playwright + axe on key routes | M8 audit |
| Keyboard | manual walkthrough of all E2E flows | M8 audit |
| Screen reader | NVDA + VoiceOver spot checks | M8 audit |

Findings are recorded in `docs/06-quality/08-accessibility-audit.md` with severity and status.
