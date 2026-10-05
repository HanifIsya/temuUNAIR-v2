---
id: VISION
title: Vision and scope
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["PRD", "BLUEPRINT"]
source_refs: ["proposal.pdf §A (via docs/_source/proposal-extract.md)", "DEC-011", "DEC-018", "Blueprint §1.4"]
---

# Vision and scope

## Vision

> Every lost item on every UNAIR campus finds its way home — reported in under a minute,
> matched by AI across text, photo, place and time, and returned through a safe, verified,
> recorded handover.

TemuUNAIR replaces scattered WhatsApp/Instagram lost-and-found with one trustworthy campus
service. It is *not* a marketplace, *not* a social network, and *not* a surveillance tool:
it stores the minimum needed to reunite people with their belongings.

## In scope (MVP)

| Area | Included |
|---|---|
| Campuses | **Kampus A, B, C, Banyuwangi (FIKKIA)** — single tenant, campus-scoped moderation |
| Users | Civitas akademika with an allowed UNAIR email domain; roles `USER`, `MODERATOR` (campus-scoped), `ADMIN` |
| Items | Everyday campus items in 19 categories (Blueprint §5A.2), incl. sensitive: `ID_CARD`, `BANK_CARD`; sensitive-lite: `WALLET` |
| Reporting | LOST and FOUND reports with ≤5 photos, location, time window, custody (`HELD_BY_FINDER` / `AT_DROP_POINT`), 1–3 hidden-detail verification hints (FOUND) |
| Discovery | Browse with filters, text search (Postgres FTS `simple`), image search, AI match suggestions (STRONG/POSSIBLE bands, explainable reasons) |
| Verification | Hidden-detail challenge → finder approves/rejects → moderator arbitrates disputes |
| Return | In-app text chat tied to a claim, handover plan, two-sided confirmation → `RETURNED` |
| Notifications | In-app + email (per-type preferences, dedupe) |
| Administration | Moderation queue, flags, disputes, user management, locations/drop points, audit log, stats |
| Privacy | EXIF stripping, masked photos for sensitive items, no public browsing (login required), account deletion with anonymization |
| Languages | Bahasa Indonesia (default) and English, `Asia/Jakarta` time zone |

## Out of scope (MVP)

Native apps · payments/rewards · automatic item release · anonymous public browsing ·
sharing phone numbers/emails by default · voice/video · multi-university · item shipping ·
insurance · OCR owner notification (stretch, DEC-014) · YOLO fine-tuning (stretch, DEC-015).

## Campuses covered

TemuUNAIR operates as a single-tenant deployment serving all four Universitas Airlangga campuses,
with campus-scoped moderation and drop points (DEC-006, DEC-010):

| Campus | Locations & faculties | Moderation scope |
|---|---|---|
| **Kampus A** | Jl. Mayjen Prof. Dr. Moestopo 47 (FK, FKG) | Campus A moderators |
| **Kampus B** | Jl. Dharmawangsa Dalam (FEB, FH, FISIP, FIB, FPsi, FF, Pascasarjana) | Campus B moderators |
| **Kampus C** | Jl. Dr. Ir. H. Soekarno, Mulyorejo (FST, FPK, FKH, FKM, FTMM, RSUA) | Campus C moderators |
| **Banyuwangi (FIKKIA)** | Kampus Giri & Kampus Sobo, Banyuwangi (FIKKIA) | FIKKIA moderators |

## Release slicing

```mermaid
flowchart LR
  M0[bootstrap] --> M1[docs] --> M2[contracts] --> M3[walking skeleton] --> M4[reporting] --> M5[matching] --> M6[claims] --> M7[admin] --> M8[hardening] --> M9[launch]
```

| Slice | Demonstrable outcome |
|---|---|
| M3 | Login works; a report can be created and read back through the API |
| M4 | Full report wizard (lost + found) with photos and hints; browse/search |
| M5 | AI matches appear with reasons; notifications fire |
| M6 | Claim → approve → chat → handover → returned, end-to-end |
| M7 | Moderation, disputes, users, places, audit |
| M8 | Security/privacy/a11y hardening, performance budget met |
| M9 | UAT, demo day, deployment |

## Boundaries and constraints

1. **Identity:** login is restricted to allowed domains (DEC-001); no anonymous accounts.
2. **Privacy:** UU PDP (Law 27/2022) is a design constraint, not an afterthought (DEC-017):
   purpose limitation, data minimisation, deletion on request, retention limits.
3. **AI is advisory:** the system never releases an item or reveals private details
   automatically (DEC-012). Humans decide.
4. **No Redis:** queueing runs on Postgres via `pg-boss` (DEC-013).
5. **CPU-only ML:** ViT-B/32 + small YOLO must fit the latency budget without GPUs (DEC-011).
6. **Coursework context:** deliverables are mapped in `docs/09-course/README.md`.
