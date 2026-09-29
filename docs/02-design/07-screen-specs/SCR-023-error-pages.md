---
id: SCR-023
title: Error pages
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["IA", "FE-11"]
source_refs: ["FE-01", "FE-11", "5A.14-error-catalog"]
---

# SCR-023 — Error pages (`/403`, `/404`, `/500`, `/offline`)

## Purpose
Explain what happened in plain Indonesian, offer the next best action, and never leak whether a
hidden resource exists.

## Entry points / exits
Entry: route guards, `notFound()`, error boundaries, offline detection.
Exits: `/home`, `/reports`, `/login`, retry.

## Layout regions
Centered card: illustration/icon, `<h1>` message, one-sentence explanation, primary action,
secondary link, and (for 500) a copyable `requestId`.

| Page | Message (id) | Primary action |
|---|---|---|
| `/403` | "Kamu tidak punya akses ke halaman ini" | Kembali ke beranda |
| `/404` | "Halaman atau laporan tidak ditemukan" | Cari laporan / Beranda |
| `/500` | "Terjadi kesalahan di sisi kami" + requestId | Coba lagi |
| `/offline` | "Kamu sedang offline" | Coba lagi |

`NOT_FOUND` for hidden resources is deliberate: the same page appears for removed, cancelled
and non-visible reports (never reveal existence).

## Data
None. `requestId` comes from the error boundary context.

## Components
`ErrorState` (027) · `EmptyState` (027).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| — | — | `/500` is itself the error page | `/403` | `/offline` |

## Copy keys
`error.403.title/body` · `error.404.title/body` · `error.500.title/body` ·
`error.offline.title/body` · `error.retry` ("Coba lagi") · `error.copyRequestId`
("Salin kode kesalahan").

## Analytics
`error_shown{code}` (code only, no message text).

## Accessibility
- `<h1>` announces the state; focus moves to the heading on mount.
- The requestId copy button announces success to screen readers.

## Test hooks
`error-page-403`, `error-page-404`, `error-page-500`, `error-page-offline`,
`error-request-id`, `error-retry-button`.

## Open questions
- `OPEN`: whether to include a support link on `/500` (depends on the support mailbox decision).
