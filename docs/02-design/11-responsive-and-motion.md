---
id: RESPONSIVE
title: Responsive design and motion
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["TOKENS", "WIREFRAMES"]
source_refs: ["NFR-043, NFR-061", "Blueprint §5B.11"]
---

# Responsive design and motion

## Breakpoints and layout

| Token | Width | Navigation | Content | Grid |
|---|---|---|---|---|
| `sm` | 360–767 px | bottom nav (5 items), top bar with title | single column, 16 px gutters | 2-col cards |
| `md` | 768–1023 px | top nav | single column max 720 px | 3-col cards |
| `lg` | 1024–1279 px | top nav | content max 720 px reading, 1200 px admin | 4-col cards |
| `xl` | ≥ 1280 px | top nav | admin side nav expanded | 4-col cards |

### Rules

1. Design at 360 px first; never assume hover.
2. Primary action stays reachable with one thumb: sticky footers on wizard and claim room.
3. Tables collapse to card lists on mobile (admin is desktop-first but must remain readable at
   768 px).
4. Images: `width/height` set to avoid layout shift; `object-fit: cover` thumbnails at 4:3.
5. Safe areas: respect `env(safe-area-inset-bottom)` for the bottom nav and sticky bars.
6. Touch targets ≥ 44×44 px; spacing ≥ 8 px between destructive and primary actions.
7. Long titles truncate at 2 lines in cards, full text on detail; no horizontal scroll ever.

## Motion

| Element | Motion | Reduced motion |
|---|---|---|
| Page transitions | none (MVP) | — |
| Sheet/drawer | slide 200 ms + scrim fade | fade 120 ms |
| Toast | slide-up 200 ms | fade 120 ms |
| Wizard step | 120 ms cross-fade | instant |
| Card hover/press | translate 1 px + shadow | none |
| Skeleton | shimmer 1.2 s loop | static grey |
| Chat new message | subtle fade-in | instant |

### Rules

1. Motion communicates state, never decorates.
2. Never block input during animation; animations are interruptible.
3. `@media (prefers-reduced-motion: reduce)` → opacity-only, max 120 ms, or instant.
4. No parallax, no auto-rotating carousels, no motion over 320 ms.
5. Loading indicators after 300 ms delay (avoid flicker on fast connections).

## Performance-related UI rules

- Skeletons match the final layout dimensions to avoid jumps.
- Images lazy-load below the fold; hero/landing images eager with `fetchpriority="high"`.
- Lists virtualise only if > 100 rows (admin); otherwise explicit pagination.
- Polling pauses when the tab is hidden (`document.visibilityState`).
