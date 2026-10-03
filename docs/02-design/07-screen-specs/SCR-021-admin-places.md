---
id: SCR-021
title: Admin places (locations and drop points)
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["SCR-018", "14-admin-console-design", "CMP"]
source_refs: ["FE-01", "API-ADM-12..13", "FR-ADM-004", "DEC-005"]
---

# SCR-021 — Admin places (`/admin/places`)

## Purpose
Keep the campus location tree and drop-point list accurate — these drive reporting, matching
and handover suggestions.

## Entry points / exits
Entry: admin sidebar; "Kelola titik penitipan" from the handover panel (admin only). Exits: none.

## Layout regions
1. Two tabs: **Lokasi** (locations) · **Titik penitipan** (drop points).
2. Locations: campus selector, tree/table of locations (kind: BUILDING, ROOM, CANTEEN, LIBRARY,
   PARKING, PRAYER, SPORT, OUTDOOR, OTHER), inline add/edit, active toggle.
3. Drop points: table (name, campus, linked location, hours, contact note, active) + create/edit
   form; `hours` edited as structured fields (days + open/close) serialized to `jsonb`.
4. Preview: "tampilan publik" of a drop-point card.

## Data
| Field | API | Notes |
|---|---|---|
| Locations | API-ADM-12 | CRUD; deactivating hides from pickers but keeps history |
| Drop points | API-ADM-13 | CRUD; used by `DropPointCard` and handover suggestions |

## Components
`AdminTable` (033) · `DropPointCard` (032) · `ConfirmDialog` (029) · `ToastProvider` (036).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| table skeleton | "Belum ada lokasi/titik penitipan" + add | `ErrorState` + retry; validation errors inline | `/403` for non-admin | — |

## Copy keys
`admin.places.tab.locations` · `admin.places.tab.dropPoints` · `admin.places.location.add` ·
`admin.places.dropPoint.add` · `admin.places.hours.days` · `admin.places.hours.open` ·
`admin.places.hours.close` · `admin.places.contactNote` ·
`admin.places.preview` ("Pratinjau tampilan publik").

## Analytics
`admin_places_viewed`, `admin_location_saved`, `admin_drop_point_saved`.

## Accessibility
- Tree navigation with arrow keys where a tree is used; otherwise a flat table.
- Hours editor uses labelled time inputs with clear 24-hour format; errors announced.

## Test hooks
`admin-places-tab-<name>`, `admin-location-row-<id>`, `admin-location-add`,
`admin-drop-point-row-<id>`, `admin-drop-point-add`, `admin-places-preview`.

## Open questions
- `OPEN`: real drop-point list and hours per campus (O-1 in `14-operations-model.md`).
- `OPEN`: whether locations need geo coordinates in MVP (used only for optional map pin).
