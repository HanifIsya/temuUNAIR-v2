---
id: FE-07
title: Design token usage
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["TOKENS", "FE-03"]
source_refs: ["Blueprint §5B.11"]
---

# FE-07 — Design token usage

Tokens are defined in `docs/02-design/03-design-tokens.md` and exported as
`docs/02-design/tokens.json`, which generates the Tailwind theme
(`apps/web/src/styles/theme.css`). **No raw hex, px, font names or z-index numbers in
components** — only token utilities/classes.

## Token → purpose map

| Purpose | Token | Forbidden alternative |
|---|---|---|
| Page background | `bg-surface` | `bg-white`, `#fff` |
| Muted section | `bg-surface-muted` | `bg-gray-50` |
| Body text | `text-text` | `text-black`, `text-gray-900` |
| Secondary text | `text-text-muted` | `text-gray-500` |
| Primary action | `bg-primary-700 text-white` | any blue hex |
| Hover/focus ring | `ring-primary-500` | default browser ring without colour |
| Accent badge | `bg-accent-400 text-text` | yellow text on white (contrast fail) |
| Success | `bg-success-600 text-white` + icon | colour-only status |
| Warning | `bg-warn-600 text-white` + icon | |
| Danger | `bg-danger-600 text-white` + icon | |
| Borders | `border-border` | `border-gray-200` |
| Card radius | `rounded-md` (12 px) | arbitrary `rounded-[11px]` |
| Chip radius | `rounded-full` | |
| Shadow | `shadow-sm` / `shadow-md` | custom box-shadows |
| Spacing | `p-1..p-8` scale | arbitrary `p-[13px]` |
| Text sizes | `text-sm/base/lg/xl/2xl/3xl` | arbitrary `text-[15px]` |
| Fonts | `font-sans` / `font-mono` | font-family declarations |
| Z-index | `z-sticky/modal/toast` | arbitrary numbers |
| Breakpoints | `sm/md/lg/xl` | custom media queries in components |

## Enforcement

| Layer | Mechanism |
|---|---|
| Lint | ESLint rule rejecting hex colours and arbitrary px values in className strings (`temuunair/no-raw-tokens`) |
| Review | Reviewer checklist item: no raw values (`06-code-review-checklist.md`) |
| Tests | Component tests assert status colours come with icons/text (a11y) |

## Usage patterns

```tsx
// primary button
<button className="bg-primary-700 text-white rounded-md px-4 py-2
                   hover:bg-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500">
// status badge (icon + text + colour)
<span className="inline-flex items-center gap-1 rounded-full bg-success-600/10
                 text-success-600 px-2 py-0.5 text-xs font-medium">
  <CheckIcon aria-hidden /> Disetujui
</span>
// sensitive notice
<div className="bg-accent-100 text-text rounded-md p-3">…</div>
```

## Contrast and status rules

1. Yellow (`accent-400`) is a background/badge colour only; text on it is `text-text`.
2. Status is never colour-only: always icon + text + colour.
3. Every text/background pair must pass WCAG 2.2 AA (`10-accessibility.md` contrast table).
4. Focus rings use `primary-500` with ≥ 3:1 against adjacent colours.

## Dark theme

MVP ships light only, but components must use tokens so a dark theme is a token swap. No
component may branch on theme or hard-code colours.

## Placeholder notice

The palette values are placeholders until TMU-DSG-001 samples `docs/_source/logo.png`. Changing
token values is allowed without a contract bump **only** if token names and contrast guarantees
hold; renaming or removing a token is a contract change.
