---
id: GLOSSARY
title: Glossary — Indonesian ↔ English
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["PRD"]
source_refs: ["proposal.pdf (pending extract)", "Blueprint §4.2"]
---

# Glossary

Terms used across docs, UI copy (`id-ID`) and code (English). Code identifiers always use the
English term; UI uses the Indonesian column.

| Indonesian (UI) | English (code/docs) | Meaning in TemuUNAIR |
|---|---|---|
| Barang hilang | Lost item | An item its owner cannot find |
| Barang ditemukan | Found item | An item someone else picked up or received |
| Laporan | Report | A LOST or FOUND record |
| Pelapor | Reporter | The user who created a report |
| Penemu | Finder | The reporter of a FOUND report |
| Pemilik | Owner / claimant | The person claiming a found item |
| Civitas akademika | Campus community | Students and staff of UNAIR |
| KTM | Student ID card | `ID_CARD` category; sensitive (DEC-014) |
| KTP | National ID card | `ID_CARD`; sensitive; **never publicly listed** |
| Verifikasi | Verification | The hidden-detail challenge that proves ownership |
| Pertanyaan rahasia | Hidden-detail hint | Finder-written prompt + private answer (DEC-004) |
| Klaim | Claim | A claimant's request to take a found item |
| Serah terima | Handover | The physical return, confirmed by both parties |
| Titik penyerahan | Drop point | Admin-managed location (e.g. security post) where items are held (DEC-005) |
| Titik penitipan | Custody | Who holds the item: `HELD_BY_FINDER` or `AT_DROP_POINT` |
| Kampus A / B / C / Banyuwangi (FIKKIA) | Campuses | The four supported campuses |
| Moderator | Moderator | Campus-scoped role that verifies and moderates (DEC-006) |
| Admin | Administrator | Global role managing users, places, reindex |
| Laporan kedaluwarsa | Expired report | Past `expires_at`; renew within 30-day grace (DEC-007) |
| Kecocokan | Match | An AI-suggested pairing of a LOST and a FOUND report |
| Pencocokan | Matching | The multimodal comparison pipeline |
| Bahasa Indonesia | Indonesian | Default locale `id` (DEC-008) |
| UU PDP | Personal Data Protection Law | Law No. 27/2022 — design constraint (DEC-017) |

## Status vocabulary (user-facing mapping)

| Code (`ReportStatus`) | Indonesian label (UI) | Notes |
|---|---|---|
| `PENDING_REVIEW` | Menunggu peninjauan | Hidden from browse/search |
| `OPEN` | Aktif | Visible |
| `MATCHED` | Ada kecocokan | Visible; owner notified |
| `IN_VERIFICATION` | Sedang diverifikasi | Claim approved |
| `RETURNED` | Sudah dikembalikan | Terminal success |
| `EXPIRED` | Kedaluwarsa | Renewable within grace |
| `CANCELLED` | Dibatalkan | Terminal |
| `REMOVED` | Dihapus moderator | Terminal unless restored |

| Code (`ClaimStatus`) | Indonesian label (UI) |
|---|---|
| `SUBMITTED` | Menunggu keputusan |
| `APPROVED` | Disetujui |
| `REJECTED` | Ditolak |
| `DISPUTED` | Dalam sengketa |
| `COMPLETED` | Selesai |
| `CANCELLED` | Dibatalkan |
| `EXPIRED` | Kedaluwarsa |

## Naming rules

1. Code, DB columns and API fields: **English**, `camelCase` (API) / `snake_case` (DB).
2. UI strings: **Bahasa Indonesia** first, English mirror; never concatenated.
3. Enum values: `SCREAMING_SNAKE_CASE` English (e.g. `HELD_BY_FINDER`).
4. Do not translate identifiers; translate only message files (`i18n/messages/{id,en}.json`).
