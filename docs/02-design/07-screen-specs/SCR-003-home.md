---
id: SCR-003
title: Home dashboard
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["IA", "FE-02", "CMP"]
source_refs: ["FE-01", "API-ME-01", "API-REP-03", "API-NTF-04"]
---

# SCR-003 — Home (`/home`)

## Purpose
Answer "what should I do now?" in one screen: report, see my reports, react to matches.

## Entry points / exits
Entry: after login, bottom-nav "Beranda", logo. Exits: `/reports/new?type=lost|found`,
`/me/reports`, `/reports/[id]/matches`, `/notifications`.

## Layout regions
1. Greeting (first name only) + `NotificationBell`.
2. Two large CTAs: "Saya Kehilangan" (primary), "Saya Menemukan" (accent).
3. "Laporan saya" preview (max 3) + "Lihat semua".
4. "Kecocokan terbaru" preview (max 3 `MatchCard`s).
5. Onboarding hint for first-time users (dismissible, localStorage).

## Data
| Field | API | Query key | Notes |
|---|---|---|---|
| Me | API-ME-01 | `['me']` | name, locale, role |
| My reports (active) | API-REP-03 `?status=OPEN,MATCHED` | `['reports','mine',{status:'active'}]` | max 3 shown |
| Unread count | API-NTF-04 | `['notifications','unread']` | poll 30 s, paused when hidden |
| Top matches | API-MAT-01 per active report | `['matches',reportId]` | first active report only; CSR after reports load |

## Components
| CMP | Variant | Notes |
|---|---|---|
| 001 | app shell | bottom nav mobile |
| 002 | `NotificationBell` | count from NTF-04 |
| 004 | `ReportCard` | `variant="mine"` |
| 005 | `ReportGrid` | compact list |
| 017/018 | `MatchCard`, `MatchBandBadge` | no raw score |
| 027 | `EmptyState` | "Belum ada laporan" |
| 028 | `Skeletons` | card skeletons ×3 |

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| card skeletons | CTA-focused `EmptyState` "Belum ada laporan — mulai lapor" | `ErrorState` + retry per section | — | cached data + "kamu sedang offline" banner |

## Copy keys
`home.greeting` ("Halo, {name}") · `home.cta.lost` ("Saya Kehilangan") ·
`home.cta.found` ("Saya Menemukan") · `home.myReports` ("Laporan saya") ·
`home.matches` ("Kecocokan terbaru") · `home.empty` ("Belum ada laporan").

## Analytics
`home_viewed`, `home_cta_clicked{type}`, `match_viewed{band}` (from card open).

## Accessibility
- `<h1>` = greeting; CTAs are links with descriptive text (not icon-only).
- Match card exposes one link; band conveyed with icon + text.

## Test hooks
`home-lost-cta`, `home-found-cta`, `home-report-card-<id>`, `home-match-card-<id>`.

## Open questions
- `OPEN`: whether to show POSSIBLE-band matches on home or only STRONG.
