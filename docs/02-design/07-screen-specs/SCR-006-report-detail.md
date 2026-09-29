---
id: SCR-006
title: Report detail
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["IA", "FE-02", "CMP"]
source_refs: ["FE-01", "API-REP-04", "API-CLM-01", "API-REP-08", "FR-REP-009", "FR-CLM-001"]
---

# SCR-006 — Report detail (`/reports/[id]`)

## Purpose
Show everything a visitor needs to decide "this is mine" or "this is not mine", with the claim
entry point. Three views: public, owner, moderator.

## Entry points / exits
Entry: browse/search results, notifications, chat deep links.
Exits: `/claims/new?reportId=`, `/reports/[id]/matches` (owner), `/reports/[id]/edit` (owner),
`/login` (signed out → redirect back).

## Layout regions
1. Header: back, owner menu (`⋯`: edit, cancel, renew, share).
2. `ImageGallery` (masked images non-zoomable, masked badge).
3. Badges: type, status, sensitive notice.
4. Title (`<h1>`), campus + location, occurred-at, custody/drop point.
5. Description (generalized when sensitive).
6. Reporter display (first name + initial).
7. Primary action: "Ini barang saya — Klaim" (hidden for the owner and for LOST reports).
8. Secondary: "Laporkan laporan ini" (`FlagDialog`).
9. Owner-only panel: match count → link to matches, hint prompts, active claim link.

## Data
| Field | API | Query key | Notes |
|---|---|---|---|
| Report | API-REP-04 | `['reports','detail',id]` | SSR first paint, then CSR refresh |
| Challenge availability | API-CLM-01 | `['challenge',id]` | fetched on claim CTA click |
| Flag | API-REP-08 | — | mutation |
| Owner actions | API-REP-05/06/07 | — | invalidate `reports.*`, `matches(id)` |

## Components
`ImageGallery` (012) · `StatusBadge` (007) · `SensitiveNotice` (016) · `ConfirmDialog` (029) ·
`FlagDialog` (030) · `SafetyTipBanner` (031) · `DropPointCard` (032).

## States
| Loading | Empty | Error | Forbidden/not found | Offline |
|---|---|---|---|---|
| detail skeleton | — | `ErrorState` + retry | `NOT_FOUND` page (also for hidden/removed reports — never reveal existence) | cached detail + banner; actions disabled |

## Copy keys
`report.detail.claim` ("Ini barang saya") · `report.detail.flag` ("Laporkan laporan ini") ·
`report.detail.masked` ("Foto disamarkan untuk melindungi pemilik") ·
`report.detail.custody.held` ("Dititipkan penemu") ·
`report.detail.custody.dropPoint` ("Di titik penitipan: {name}") ·
`report.detail.reporter` ("Dilaporkan oleh {name}").

## Analytics
`report_viewed{type,category,sensitive}` (no ids), `claim_started` (on CTA click),
`report_flagged{reason}`.

## Accessibility
- One `<h1>`; gallery images have alt from title (masked → "Foto disamarkan").
- Masked images are not zoomable and have no download control.
- Status badges are icon + text; drop point card link opens maps in a new tab with
  `rel="noopener"` and a warning for external navigation.

## Test hooks
`report-detail-title`, `report-claim-button`, `report-flag-button`,
`report-sensitive-notice`, `report-owner-panel`, `report-gallery-image-<n>`.

## Open questions
- `OPEN`: whether moderators see a "view as public" toggle to verify masking (recommended yes).
