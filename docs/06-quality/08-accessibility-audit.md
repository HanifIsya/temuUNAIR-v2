---
id: A11Y-AUDIT
title: Accessibility audit (M8)
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["A11Y", "FE-09"]
source_refs: ["NFR-040..043", "Blueprint §4.7"]
---

# Accessibility audit

> **Status: pending (M8).** This file is the template and running log; results are filled during
> the M8 hardening milestone. Component-level axe checks run continuously from M3.

## Scope

| Area | Routes / components |
|---|---|
| Public | `/`, `/login`, `/help`, `/help/safety`, `/privacy`, `/terms` |
| Core app | `/home`, `/reports`, `/reports/[id]`, `/reports/new`, `/me/reports`, `/claims`, `/claims/[id]`, `/notifications`, `/me/settings` |
| Admin | `/admin`, `/admin/reports`, `/admin/claims`, `/admin/users`, `/admin/places`, `/admin/audit` |
| Components | all `CMP-###` from `08-component-inventory.md` |

## Automated checks

| Check | Tool | Command | Target |
|---|---|---|---|
| Component axe | jest-axe | `pnpm test:unit` | zero violations per component test |
| Page axe | Playwright + axe-core | `pnpm test:a11y` (M8) | zero critical/serious |
| Contrast | token check + manual sampling | `scripts/check-contrast.mjs` | all AA pairs pass |
| Lighthouse a11y | Lighthouse CI | `gate:full` (M8) | score ≥ 95 |

## Manual checks

| # | Check | Method | Result |
|---|---|---|---|
| 1 | Keyboard-only walkthrough of all E2E flows | manual | pending |
| 2 | Focus visibility and order on every interactive element | manual | pending |
| 3 | Dialog/drawer focus trap + restore | manual | pending |
| 4 | Screen reader pass (NVDA) on core flows | manual | pending |
| 5 | Screen reader pass (VoiceOver) spot check | manual | pending |
| 6 | 200% zoom without loss of content | manual | pending |
| 7 | `prefers-reduced-motion` behaviour | manual | pending |
| 8 | Touch target sizes ≥ 44 px on mobile | manual + script | pending |
| 9 | Language attribute switches with locale | manual | pending |
| 10 | Error announcements (form + toast) | manual | pending |
| 11 | Masked image alt text and non-zoom behaviour | manual | pending |
| 12 | Chat `aria-live` behaviour under rapid messages | manual | pending |

## Findings log

| ID | Severity | Page/Component | Description | Fix task | Status |
|---|---|---|---|---|---|
| (filled at M8) | critical/serious/moderate/minor | | | | |

## Exit criteria (M8)

1. Zero critical/serious axe findings; moderate findings have tasks.
2. Keyboard walkthrough completes all E2E flows without a mouse.
3. Screen reader pass can complete: login → report → browse → claim → chat → handover.
4. Contrast table verified against the final palette (post TMU-DSG-001).
5. Findings with fixes merged; residual minors documented with owners.

## Notes

- Component tests from M3 already enforce: labelled inputs, one `<h1>`, icon+text status, focus
  management, keyboard operability of uploads and pickers.
- This audit verifies the *integration* of those guarantees, not just the units.
