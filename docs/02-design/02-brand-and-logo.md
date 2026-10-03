---
id: BRAND
title: Brand and logo
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["DESIGN-PRINCIPLES"]
source_refs: ["proposal.pdf §C.1 Logo dan Filosofi (via docs/_source/proposal-extract.md)", "docs/_source/logo.png (placeholder)", "Blueprint §4.3"]
---

# Brand and logo

> **Placeholder-logo caveat (`SRC-README`, `TMU-DSG-001`).** The currently tracked `docs/_source/logo.png`
> is a generated placeholder (magnifier + yellow dot, brand placeholder colours). The real logo was identified
> in `proposal.pdf §C.1 p. 3` (figure 2, magnifier + backpack inside a location-pin, "Lost Today, Found Together")
> and will be sampled in `TMU-DSG-001`. The philosophy, usage rules, and clear space below represent the agreed
> design intent and match the proposal's mark.

## Name and tagline

| Item | Value |
|---|---|
| Product name | **TemuUNAIR** |
| Tagline (EN) | *Lost Today, Found Together* |
| Tagline (ID, recommended) | *Hilang hari ini, ketemu bersama* — `OPEN`: confirm with team |
| Pronunciation note | "Temu" = to meet/find (Indonesian); UNAIR = Universitas Airlangga |

## Logo philosophy (per blueprint intent)

The logo combines:

- **Magnifier** — searching for what is lost;
- **Map pin** — campus location matters;
- **Bag/backpack** — everyday campus items;
- **Blue** — trust, calm, institutional reliability;
- **Yellow accent** — hope, warmth, campus friendliness.

`OPEN`: confirm the actual visual composition against `logo.png`; adjust this list if the real
mark differs.

## Usage rules

| Rule | Detail |
|---|---|
| Clear space | ≥ height of the "T" in the wordmark on all sides |
| Minimum size | 24 px height (digital favicon) / 32 px (app header) |
| Approved lockups | Horizontal (header), stacked (splash/footer), mark-only (favicon, app icon) |
| Background | Full colour on white/`surface`; white knockout on primary blue; never on busy photos |
| Don'ts | No stretching, no rotation, no recolouring outside the token palette, no outlines, no drop shadows, no placing yellow mark on white without a blue outline |
| Favicon | Mark-only, 32 px, includes safe padding |

## Where the logo appears

- Landing `/` hero and header, login page, email templates (header image), `/help` footer,
  favicon + web app manifest, presentation and report cover (course deliverables).
- **Never** inside report photos, chat, or moderation views.

## File conventions

| File | Use |
|---|---|
| `logo.svg` | primary digital (must be produced from source) |
| `logo-mark.svg` | favicon/app icon |
| `logo-white.svg` | on primary backgrounds |
| `logo.png` (in `_source/`) | source of truth for colour sampling |

Assets live in `apps/web/public/brand/` once produced (frontend lane task). Until then, the
header uses a text lockup so no screen is blocked.

## Accessibility

- Header logo link has `aria-label="TemuUNAIR — beranda"`.
- Decorative mark instances get empty `alt=""`; the wordmark carries the name.
- Logo alone never communicates status; it is not an interactive element except the home link.
