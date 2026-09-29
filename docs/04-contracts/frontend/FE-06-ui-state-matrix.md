---
id: FE-06
title: UI state matrix
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["STATES", "FE-01", "FE-02"]
source_refs: ["Blueprint §5B.6"]
---

# FE-06 — UI state matrix

Every page/component defines all states; agents may not ship a page without them.

| Page | Loading | Empty | Error | Forbidden / not found | Offline / stale |
|---|---|---|---|---|---|
| `/home` | skeleton cards | "Belum ada laporan" + CTAs | `ErrorState` retry | — | cached data + banner |
| `/reports` | grid skeleton | "Tidak ada hasil" + clear filters + "Buat laporan" | `ErrorState` | — | cached list + banner |
| `/reports/[id]` | detail skeleton | — | `ErrorState` | `NOT_FOUND` page (also for hidden) | cached |
| `/reports/new` | meta skeleton | — | inline field errors + form alert | 403 if suspended | draft kept, submit disabled |
| `/reports/[id]/matches` | skeleton | "Belum ada kecocokan — kami terus mencari" + rematch button | `ErrorState` | `FORBIDDEN` | cached |
| `/claims/[id]` | room skeleton | "Belum ada pesan" | `ErrorState` | `FORBIDDEN`/`NOT_FOUND` | send disabled, banner |
| `/notifications` | list skeleton | "Belum ada notifikasi" | `ErrorState` | — | cached |
| `/admin/*` | table skeleton | "Antrian kosong 🎉" | `ErrorState` | 403 page | — |

## Extended matrix (added screens)

| Page | Loading | Empty | Error | Forbidden / not found | Offline / stale |
|---|---|---|---|---|---|
| `/` (landing) | static | — | static fallback | — | cached |
| `/login` | button spinner | — | `/auth/error` with reason | domain rejected message | inline network message |
| `/reports/[id]/edit` | form skeleton | — | field errors; `409` refetch toast | `/403`/`NOT_FOUND` | save disabled; unsaved guard |
| `/me/reports` | list skeleton | "Belum ada laporan" + CTA | `ErrorState` | — | cached; mutations disabled |
| `/claims` | card skeletons | "Belum ada klaim" per tab | `ErrorState` | — | cached + banner |
| `/me/settings` | form skeleton | — | field errors + toast | — | save disabled |
| `/help`, `/help/safety` | static + drop-point skeleton | "Belum ada titik penitipan" | inline drop-point error | — | cached |
| `/admin` | stat skeletons | "Antrian kosong 🎉" sections | `ErrorState` per section | `/403` | — |
| `/admin/reports` | table skeleton | "Antrian kosong 🎉" | `ErrorState`; action failure toast | `/403` | — |
| `/admin/claims` | table skeleton | "Tidak ada sengketa" | `ErrorState` | `/403` | — |
| `/admin/users` | table skeleton | "Tidak ada pengguna" (search miss) | `ErrorState` | `/403` | — |
| `/admin/places` | table skeleton | "Belum ada lokasi/titik penitipan" | `ErrorState`; inline validation | `/403` | — |
| `/admin/audit` | table skeleton | "Tidak ada aktivitas pada rentang ini" | `ErrorState` | `/403` | — |
| `/403`, `/404`, `/500`, `/offline` | — | — | `/500` is the error page | `/403` | `/offline` |

## Component states (must all exist)

| Component | States |
|---|---|
| `ReportCard` | loading, ready, masked, sensitive-badged, mine-with-status |
| `PhotoUploader` | idle, uploading(%), processing, ready, rejected(reason), over-limit, retry |
| `MatchCard` | suggested, dismissed (removed), claimed, invalidated |
| `StatusBadge` | all `ReportStatus` + `ClaimStatus` values |
| `HandoverPanel` | none, planned, one-confirmed, both-confirmed |
| `ChatThread` | loading older, empty, new message, send failed (inline retry) |
| `NotificationItem` | unread, read, unknown type (fallback rendering) |
| `AdminTable` | loading, empty, filtered-empty, error, row action pending |
| `AnswerCompare` | claimant perspective (no expected), finder perspective (with expected), moderator |
| `WizardShell` | first step (no back), middle, last (submit), saving |

## Rules

1. Skeletons mirror the final layout (dimensions fixed) to avoid layout shift.
2. Empty states always offer exactly one primary action.
3. `ErrorState` always shows a retry and a copyable `requestId` for 5xx.
4. Offline banner is non-blocking; mutations are disabled, reads served from cache.
5. Hidden/forbidden resources render the same `NOT_FOUND` page as missing ones.
6. Every state above has a component test (`FE-12`) — a missing state is a review blocker.
