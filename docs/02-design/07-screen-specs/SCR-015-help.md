---
id: SCR-015
title: Help and safety
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["IA", "SCR-016"]
source_refs: ["FE-01", "API-META-04", "FR-HND-003"]
---

# SCR-015 — Help & safety (`/help`, `/help/safety`)

## Purpose
Public, fast answers: how the service works, how to report well, how to hand over safely, where
drop points are.

## Entry points / exits
Entry: landing footer, in-app help links, safety banners. Exits: `/login`, `/reports`.

## Layout regions
1. `/help`: FAQ accordion — reporting, matching, claiming, privacy, account.
2. `/help/safety`: safe handover guide, sensitive-item advice, drop-point list per campus
   (`DropPointCard`s from API-META-04), what to do if something goes wrong.
3. Contact block (`OPEN`: official support email).

## Data
| Field | API | Notes |
|---|---|---|
| Drop points | API-META-04 | public list is fine (name, campus, hours) |

## Components
`DropPointCard` (032) · `SafetyTipBanner` (031) · accordion primitive (CMP inventory: reuse
Radix accordion under `ui/`).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| static content + drop-point skeleton | "Belum ada titik penitipan untuk kampus ini" | inline error for drop points only; FAQ still renders | — | static content cached |

## Copy keys
`help.faq.title` · `help.faq.report.q/a` · `help.faq.match.q/a` · `help.faq.claim.q/a` ·
`help.faq.privacy.q/a` · `help.safety.title` · `help.safety.meet` ·
`help.safety.sensitive` · `help.safety.dropPoints.title`.

## Analytics
`help_viewed`, `safety_viewed`.

## Accessibility
- Accordion is keyboard operable with proper `aria-expanded`/`aria-controls`.
- Drop-point list is a real list; map links announce they open externally.

## Test hooks
`help-accordion-<topic>`, `safety-drop-point-<id>`.

## Open questions
- `OPEN`: official support contact and whether it is a person or a shared mailbox.
