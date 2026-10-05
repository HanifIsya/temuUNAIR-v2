---
id: STATES
title: Empty, error and loading states
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["COPY", "CMP", "FE-06"]
source_refs: ["Blueprint §5B.6"]
---

# Empty, error and loading states

The canonical matrix is `docs/04-contracts/frontend/FE-06-ui-state-matrix.md`; this document
explains the *design intent* and the shared patterns. No page may ship without all four states.

## Shared patterns

### Loading
- Skeletons that mirror final layout (never spinners for full pages).
- Show after 300 ms to avoid flicker; lists show 3–6 skeleton cards.
- Buttons show an inline spinner and become `aria-busy="true"`; double-submit prevented.

### Empty
- Explain why it is empty and give the single most useful action.
- Never a dead end: always one primary action (create, clear filters, browse).
- Friendly, short copy (see `09-content-and-microcopy.md` §Empty states).

### Error
- `ErrorState` shows: what happened (plain language), a retry button, and a copyable
  `requestId` for 5xx.
- Map by code (`FE-11`): `401` → login redirect; `403` → `/403`; `404` → `notFound()`;
  `409 CONFLICT_STATE` → refetch + toast; `429` → toast with `Retry-After`; `5xx` → `ErrorState`.
- Never show raw stack traces or internal codes as the only message.

### Forbidden / not found
- Hidden resources render the same `/404` page as missing ones (never reveal existence).
- Role failures render `/403` with a link home; admin routes redirect non-staff.

### Offline / stale
- Banner "Kamu sedang offline"; reads come from cache; mutations are disabled (no fake success).
- On reconnect: refetch active queries; toast "Kembali online".

## Page matrix (summary)

| Page | Loading | Empty | Error | Forbidden/not found | Offline/stale |
|---|---|---|---|---|---|
| `/home` | card skeletons | "Belum ada laporan" + CTAs | `ErrorState` retry per section | — | cached + banner |
| `/reports` | grid skeleton ×6 | "Tidak ada hasil" + clear filters + create | `ErrorState` | — | cached list + banner; search disabled |
| `/reports/[id]` | detail skeleton | — | `ErrorState` | `/404` (also hidden) | cached |
| `/reports/new` | meta skeleton | — | inline errors + form alert | `/403` if suspended | draft kept; submit disabled |
| `/reports/[id]/matches` | card skeletons | "Belum ada kecocokan" + rematch | `ErrorState` | `/403` non-owner | cached |
| `/claims` | card skeletons | "Belum ada klaim" | `ErrorState` | — | cached + banner |
| `/claims/[id]` | room skeleton | "Belum ada pesan" | `ErrorState` | `/403` or `/404` | composer disabled |
| `/notifications` | list skeleton ×5 | "Belum ada notifikasi" | `ErrorState` | — | cached; mark-read disabled |
| `/me/reports` | list skeleton | "Belum ada laporan" + CTA | `ErrorState` | — | cached; mutations disabled |
| `/me/settings` | form skeleton | — | field errors + toast | — | save disabled |
| `/admin/*` | table skeleton | "Antrian kosong 🎉" | `ErrorState` | `/403` | — |

## Component-level requirements

| Component | Required states |
|---|---|
| `PhotoUploader` | idle, uploading (%), processing, ready, rejected (with reason), too many, retry |
| `ChatThread` | loading older, empty, new message, send failed (retry inline) |
| `HandoverPanel` | none, planned (waiting other), one confirmed, both confirmed |
| `StatusStepper` | active, done, upcoming, terminal (returned/cancelled/expired) |
| `MatchCard` | suggested, dismissed (exits list), claimed (badge), invalidated |
| `AdminTable` | loading, empty, error, filtered-empty, row action pending |

## Copy and tone

- Loading: "Memuat…" only where skeletons are impossible.
- Empty: never "No data" — always human ("Belum ada laporan").
- Errors: apologise once, explain, give the next step; never blame.
- Offline: "Kamu sedang offline. Kami akan coba lagi saat koneksi kembali."
