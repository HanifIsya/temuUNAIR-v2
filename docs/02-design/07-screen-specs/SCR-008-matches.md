---
id: SCR-008
title: Match suggestions
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["SCR-006", "CMP"]
source_refs: ["FE-01", "API-MAT-01..04", "FR-MAT-001..005"]
---

# SCR-008 — Matches (`/reports/[id]/matches`)

## Purpose
Show ranked, explainable suggestions for the owner and turn the right one into a claim or an
invitation. Never show raw scores (DEC-012).

## Entry points / exits
Entry: owner panel on detail, `MATCH_SUGGESTED` notification, home match card.
Exits: `/claims/new?reportId=` (claim), dismiss (in place), `/reports/[otherId]` (view other).

## Layout regions
1. Header: report title + "Kecocokan untuk laporan ini".
2. Rematch control + last-checked timestamp ("Terakhir diperiksa 5 menit lalu").
3. Sorted list of `MatchCard`s: other report thumbnail, band badge, `ReasonChips`, actions.
4. Empty state with "Kami terus mencari" + rematch button.

## Data
| Field | API | Query key | Notes |
|---|---|---|---|
| Matches | API-MAT-01 | `['matches',reportId]` | sorted by score desc server-side |
| Dismiss | API-MAT-02 | — | optimistic removal; invalidate `['matches',reportId]` |
| Invite | API-MAT-03 | — | finder-only button on FOUND reports |
| Rematch | API-MAT-04 | — | 202 + toast; disabled 10 min (rate limit) |

## Components
`MatchCard` (017) · `MatchBandBadge`/`ReasonChips` (018) · `EmptyState`/`ErrorState` (027) ·
`Skeletons` (028) · `SafetyTipBanner` (031).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| card skeletons ×3 | "Belum ada kecocokan — kami terus mencari" + rematch | `ErrorState` + retry | `/403` (non-owner) | cached list + banner; rematch disabled |

## Copy keys
`matches.title` · `matches.empty` · `matches.rematch` ("Periksa ulang") ·
`matches.dismiss` ("Bukan ini") · `matches.invite` ("Tawarkan ke pemilik") ·
`match.band.STRONG` ("Sangat mungkin") · `match.band.POSSIBLE` ("Mungkin") ·
`match.reason.IMAGE_SIMILAR` ("Foto mirip") · `match.reason.TEXT_SIMILAR` ("Deskripsi mirip") ·
`match.reason.COLOR_MATCH` · `match.reason.BRAND_MATCH` · `match.reason.SAME_BUILDING` ·
`match.reason.SAME_CAMPUS` · `match.reason.TIME_CLOSE` ("Waktu berdekatan") ·
`match.reason.CATEGORY_MATCH`.

## Analytics
`match_viewed{band}`, `match_dismissed{band}`, `match_invited`, `rematch_requested`.

## Accessibility
- Each card exposes one primary link plus separate buttons with distinct labels ("Bukan ini"
  includes the item name for screen readers via `aria-label`).
- Band is icon + text; reasons are plain text chips.

## Test hooks
`matches-list`, `match-card-<id>`, `match-dismiss-button`, `match-invite-button`,
`matches-rematch-button`.

## Open questions
- `OPEN`: whether POSSIBLE-band matches appear here immediately or only in the daily digest.
