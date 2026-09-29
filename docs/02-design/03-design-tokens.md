---
id: TOKENS
title: Design tokens
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["BRAND", "FE-07"]
source_refs: ["Blueprint §5B.11", "docs/_source/logo.png (missing)"]
---

# Design tokens

> **Placeholder values.** The palette below is the blueprint's starting point. TMU-DSG-001
> samples the real values from `docs/_source/logo.png` and updates both this file and
> `tokens.json`. Until then these tokens are the contract (`FE-07`) — components must use
> tokens, never raw values.

## Colours

### Brand

| Token | Placeholder | Use | Contrast note |
|---|---|---|---|
| `--color-primary-900` | `#0A2A6E` | pressed states, dark surfaces | |
| `--color-primary-700` | `#0F3D9E` | primary buttons, links | ≥ 4.5:1 on white ✓ |
| `--color-primary-500` | `#1E6FD9` | hover, focus rings, icons | |
| `--color-primary-100` | `#DCE9FB` | selected backgrounds, info banners | |
| `--color-accent-400` | `#FFC72C` | highlights, badges, hope accent | **dark text only** |
| `--color-accent-100` | `#FFF4D6` | subtle accent backgrounds | |

### Semantic status

| Token | Placeholder | Meaning | Text on it |
|---|---|---|---|
| `--color-success-600` | `#1B7F4B` | returned, approved | white |
| `--color-warn-600` | `#B26A00` | expiring, pending review | white |
| `--color-danger-600` | `#B3261E` | rejected, removed, errors | white |
| `--color-info-600` | `#1E6FD9` | neutral info | white |

### Neutrals

| Token | Placeholder | Use |
|---|---|---|
| `--color-surface` | `#FFFFFF` | page background |
| `--color-surface-muted` | `#F5F7FA` | section background |
| `--color-border` | `#D9DEE7` | dividers, input borders |
| `--color-text` | `#14181F` | body text |
| `--color-text-muted` | `#5A6472` | secondary text |
| `--color-overlay` | `rgba(10,20,40,.5)` | modal scrim |

**Hard rules:** yellow is never text on white and never a status colour alone; status is always
icon + text + colour (`StatusBadge`); every text/background pair must pass WCAG 2.2 AA.

### Dark theme (phase 2, tokens reserved)

`--color-surface` `#0F1420` · `--color-text` `#E8ECF3` · borders `#2A3244` · primary shifts to
`--color-primary-500`. MVP ships light theme only; components must not hard-code colours so the
dark theme is a token swap.

## Typography

| Token | Value | Use |
|---|---|---|
| `--font-sans` | `"Plus Jakarta Sans", Inter, system-ui, sans-serif` | everything (humanist, good Latin coverage, Indonesian-friendly) |
| `--font-mono` | `ui-monospace, SFMono-Regular, monospace` | requestIds, codes in admin |
| `--text-xs` | `12px / 16px` | captions, badges |
| `--text-sm` | `14px / 20px` | secondary text, labels |
| `--text-base` | `16px / 24px` | body (never smaller on mobile inputs — iOS zoom) |
| `--text-lg` | `18px / 28px` | card titles |
| `--text-xl` | `22px / 30px` | section headings |
| `--text-2xl` | `28px / 36px` | page titles |
| `--text-3xl` | `34px / 40px` | landing hero |
| Weights | 400, 500, 600, 700 | |

## Spacing, radius, shadow, z-index

| Token | Value |
|---|---|
| `--space-1..8` | `4, 8, 12, 16, 24, 32, 48, 64` px |
| `--radius-sm/md/lg/full` | `8px, 12px, 16px, 999px` (cards 12, chips 999 — echoes the organic logo shape) |
| `--shadow-sm` | `0 1px 2px rgba(16,24,40,.06)` |
| `--shadow-md` | `0 4px 12px rgba(16,24,40,.10)` |
| `--z-base/sticky/modal/toast` | `0, 100, 1000, 1100` |

## Breakpoints (mobile-first)

| Token | Width | Layout |
|---|---|---|
| `sm` | ≥ 360 px | single column, bottom nav |
| `md` | ≥ 768 px | two columns, top nav |
| `lg` | ≥ 1024 px | content max-width 720 px for reading, 1200 px for admin tables |
| `xl` | ≥ 1280 px | admin side nav expanded |

## Motion

| Token | Value |
|---|---|
| `--motion-fast` | `120ms ease-out` |
| `--motion-base` | `200ms ease-out` |
| `--motion-slow` | `320ms ease-out` |
| Reduced motion | all transforms → opacity-only; `prefers-reduced-motion: reduce` disables transitions |

## Machine-readable file

`tokens.json` (same folder) is the canonical export consumed by the Tailwind theme
(`FE-07`). Components import from the theme; raw hex/px is a lint error.
