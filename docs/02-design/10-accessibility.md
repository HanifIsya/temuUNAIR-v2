---
id: A11Y
title: Accessibility plan (WCAG 2.2 AA)
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["DESIGN-PRINCIPLES", "TOKENS", "FE-09"]
source_refs: ["NFR-040..043", "Blueprint §5B.8"]
---

# Accessibility plan

Target: **WCAG 2.2 AA** on every user-facing flow, verified per component (jest-axe) and per
release (manual audit in M8, `docs/06-quality/08-accessibility-audit.md`).

## Contrast table (placeholder palette — re-check after TMU-DSG-001)

| Foreground | Background | Ratio (approx.) | Verdict | Use |
|---|---|---|---|---|
| `--color-primary-700` `#0F3D9E` | white | 8.6:1 | ✅ AA/AAA | links, primary buttons |
| white | `--color-primary-700` | 8.6:1 | ✅ | button text |
| `--color-text` `#14181F` | white | 16.9:1 | ✅ | body |
| `--color-text-muted` `#5A6472` | white | 5.6:1 | ✅ AA | secondary text (not for < 14 px critical info) |
| `--color-accent-400` `#FFC72C` | white | 1.6:1 | ❌ | **never** text on white |
| `--color-text` | `--color-accent-400` | 10.4:1 | ✅ | text on yellow badges |
| white | `--color-success-600` | 4.9:1 | ✅ | status chips |
| white | `--color-warn-600` | 4.6:1 | ✅ | status chips |
| white | `--color-danger-600` | 5.9:1 | ✅ | status chips |

Rules: yellow is accent/background only (dark text on top); every status also carries an icon
and a text label; focus indicators use `--color-primary-500` with ≥ 3:1 against adjacent colours.

## Per-area requirements

### Structure and semantics
- One `<h1>` per page; heading levels never skipped.
- Landmarks: `header`, `nav`, `main`, `footer`; skip-link to `#main`.
- Lists are real lists; tables use `<th scope>` and captions.
- `lang` matches the active locale; language changes announced.

### Keyboard
- Every interactive element reachable and operable; visible focus ring (never `outline: none`
  without replacement).
- Wizards: focus moves to the new step heading; `aria-current="step"` on the stepper.
- Dialogs/drawers/sheets: focus trap, ESC closes, focus restored to the trigger.
- Photo upload: a real `<button>` opens the file picker (no drop-zone-only); location picker has
  a "pilih dari daftar" alternative to the map pin.
- Chat: composer keeps focus after send; new messages do not steal focus.

### Screen readers
- `aria-live="polite"` on `ChatThread` and toasts; errors announced once.
- Form errors linked with `aria-describedby`; the summary alert links to the first invalid field.
- Icon-only buttons have `aria-label` including context (e.g. "Buka laporan Tas biru").
- Relative times expose an absolute value (sr-only or `title`).
- Masked images: alt "Foto disamarkan"; decorative images `alt=""`.

### Touch and motor
- Targets ≥ 44×44 px with ≥ 8 px spacing.
- No time-limited interactions; claim expiry is communicated in advance, not a countdown trap.
- Drag-free: reordering photos (if added) has move buttons.

### Visual
- Text resizable to 200% without loss; no fixed-height text containers.
- Information never conveyed by colour alone (status, validation, unread).
- Motion: `prefers-reduced-motion` disables transforms; no autoplay.

### Cognitive
- Plain Bahasa Indonesia; consistent verbs ("Simpan", "Kirim", "Klaim").
- Destructive actions require explicit confirmation with the consequence spelled out.
- Errors say what happened and what to do next, never blame the user.

## Verification

| Layer | Tool | When |
|---|---|---|
| Component | Vitest + jest-axe, zero violations | every component task |
| Page | Playwright axe scan on key routes | M8 audit |
| Keyboard | manual walkthrough of all E2E flows | M8 audit |
| Screen reader | NVDA (Windows) + VoiceOver (macOS) spot checks | M8 audit |
| Contrast | automated token check + manual sampling | after TMU-DSG-001 and any token change |

Findings go to `docs/06-quality/08-accessibility-audit.md` with severity and fix status.
