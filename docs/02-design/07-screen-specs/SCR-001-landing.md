---
id: SCR-001
title: Landing page
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["IA", "CMP", "TOKENS"]
source_refs: ["FE-01", "DEC-018"]
---

# SCR-001 — Landing (`/`)

## Purpose
Explain TemuUNAIR in 5 seconds and get the user to sign in. Public, no data.

## Entry points / exits
Entry: search engines, shared links, QR on posters. Exits: `/login`, `/help`, `/help/safety`,
`/privacy`, `/terms`.

## Layout regions (mobile → desktop)
1. Header: logo + "Masuk" button (top nav on desktop).
2. Hero: tagline "Lost Today, Found Together" + one-sentence explanation in Indonesian +
   primary button "Masuk dengan akun UNAIR".
3. Three value cards: Lapor cepat · Dicocokkan AI · Serah terima aman.
4. How it works: 4 illustrated steps mirroring the PDF flow.
5. Safety note + drop-point mention.
6. Footer: help, privacy, terms, campus list.

## Data
None (static). No API calls. Must render with JS disabled for the hero text.

## Components used
| CMP | Variant | Notes |
|---|---|---|
| 001 | public header | no bottom nav when signed out |
| 031 | `SafetyTipBanner` | "Bertemu di area kampus yang ramai" |

## States
| Loading | Empty | Error | Forbidden/not found | Offline |
|---|---|---|---|---|
| none (static) | — | static fallback | — | static works offline after first load |

## Copy keys
| Key | id | en |
|---|---|---|
| `landing.hero.title` | TemuUNAIR — Hilang hari ini, ketemu bersama | TemuUNAIR — Lost Today, Found Together |
| `landing.hero.subtitle` | Lapor barang hilang atau temuan di kampus UNAIR. Kami bantu mencocokkan. | Report lost or found items on UNAIR campus. We help match them. |
| `landing.cta.login` | Masuk dengan akun UNAIR | Sign in with UNAIR account |
| `landing.value.report.title` | Lapor dalam 1 menit | Report in a minute |
| `landing.value.match.title` | Dicocokkan otomatis | Matched automatically |
| `landing.value.safe.title` | Serah terima aman | Safe handover |
| `landing.steps.1..4` | (lihat `09-content-and-microcopy.md`) | |

## Analytics events
`landing_viewed` (no props) · `landing_login_clicked`.

## Accessibility notes
- One `<h1>` (hero). Decorative illustrations `alt=""`.
- Contrast: hero text on white/solid surface; never yellow text on white.
- Login button is a link styled as a button, focus-visible ring.

## Test hooks
`landing-hero`, `landing-login-button`, `landing-value-card-<n>`.

## Open questions
- `OPEN`: final tagline in Indonesian (see `02-brand-and-logo.md`).
