---
id: SCR-005
title: Browse and search
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["IA", "FE-02", "CMP"]
source_refs: ["FE-01", "API-REP-02", "API-SRC-01", "API-META-*", "FR-SRC-001..006"]
---

# SCR-005 — Browse + search (`/reports`)

## Purpose
Find a report by scrolling, filtering, text search or photo search. URL state is shareable.

## Entry points / exits
Entry: bottom nav "Cari", home "Lihat semua", deep links with params.
Exits: `/reports/[id]`, `/reports/new`.

## Layout regions
1. Search bar (text input + image-search button that opens camera/upload).
2. Filter chips: Kampus, Kategori, Waktu, Penitipan — open bottom sheets (mobile) / left panel
   (desktop); a "Hapus filter" action appears when active.
3. Result count + sort control (`-createdAt` default).
4. `ReportGrid` (2-col mobile, 4-col desktop) + "Muat lebih banyak" button.
5. Empty/error states replace the grid.

## Data
| Field | API | Query key | Notes |
|---|---|---|---|
| List | API-REP-02 | `['reports','list',filters]` | cursor pagination, limit 20 |
| Search | API-SRC-01 | `['reports','search',{q,imageUploadId,filters}]` | triggered on submit, not per keystroke |
| Meta | API-META-01..03 | `['meta',name,params]` | staleTime 1 h |
| Image upload | API-UPL-01..03 | — | search by photo |

Filters live in the URL (`campus`, `category`, `dateFrom`, `dateTo`, `custody`, `type`, `q`,
`sort`, `cursor`). Default type = opposite of the user's active report intent; `?type=` overrides.

## Components
`ReportFilterBar` (006) · `ReportCard` (004, `variant="browse"`) · `ReportGrid` (005) ·
`EmptyState`/`ErrorState` (027) · `Skeletons` (028) · `SensitiveNotice` badge on masked cards.

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| grid skeleton ×6 | "Tidak ada hasil" + "Hapus filter" + "Buat laporan" | `ErrorState` + retry | — (login required, redirected) | cached list + banner; search disabled |

## Copy keys
`browse.search.placeholder` ("Cari barang, merek, warna…") · `browse.filter.campus` ·
`browse.filter.category` · `browse.filter.time` · `browse.filter.custody` ·
`browse.empty` ("Tidak ada hasil") · `browse.loadMore` ("Muat lebih banyak") ·
`browse.search.image` ("Cari dengan foto").

## Analytics
`search_performed{mode:text|image|browse, resultCount}`, `search_filter_changed{filter}`,
`search_result_opened{position}` (position bucket only, no ids).

## Accessibility
- Search input labelled; image search is a button with visible label.
- Filter sheets trap focus and restore it; chips announce state via `aria-pressed`.
- Cards expose one link; masked photos have alt "Foto disamarkan".

## Test hooks
`browse-search-input`, `browse-filter-<name>`, `browse-results`, `report-card-<id>`,
`browse-load-more`.

## Open questions
- `OPEN`: whether image search is visible in MVP or feature-flagged after M5.
