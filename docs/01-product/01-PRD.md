---
id: PRD
title: Product Requirements Document — TemuUNAIR
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["BLUEPRINT", "SRC-README"]
source_refs: ["proposal.pdf §A/§B/§D (via docs/_source/proposal-extract.md)", "DEC-001..DEC-024", "Blueprint §1"]
---

# PRD — TemuUNAIR ("Lost Today, Found Together")

> **Source note.** `docs/_source/proposal.pdf` is **committed** (SHA-256 `028501CB…F8B9`) and
> `docs/_source/proposal-extract.md` provides the citation-first transcription (status `draft`,
> human verification pending). Indonesian labels are verbatim only where a `proposal.pdf §…`
> citation says so — §2.1 now quotes *Tujuan 1–5* and the *Cara Kerja* 8 steps directly
> (OQ-1 answered by `TMU-DOC-003`). Everything else in this document remains product
> restatement, not source text.

## 1. Problem

Civitas akademika UNAIR loses everyday items across four campuses (A, B, C, Banyuwangi/FIKKIA)
and currently relies on scattered WhatsApp groups, Instagram stories and physical notice boards.
Consequences:

- Reports disappear in chat scroll; there is no single searchable place.
- Finders and losers rarely connect because nothing compares *text, photo, place and time*.
- Handovers happen over personal phone numbers with no verification and no record.
- Sensitive items (KTM, ATM cards, passports) get posted publicly with identity details visible.

## 2. Goals (PDF "Tujuan 1–5")

| ID | Goal | How we know it is met | Trace |
|---|---|---|---|
| G1 | Make reporting a lost or found item fast and effortless for civitas akademika | Median time-to-submit a report < 60 s on mobile | §11 |
| G2 | Automatically suggest likely matches using text + photo + location + time (AI) | Precision@5 of suggestions ≥ target on the eval set; match notifications delivered | §11, `07-ml-evaluation-plan.md` |
| G3 | Let both sides verify ownership and arrange a safe return inside the platform | ≥ X% of approved claims complete with two-sided confirmation; zero phone-number exposure | §11 |
| G4 | Give admins/moderators tools to verify, moderate and manage reports and places | Moderation queue SLA; 100% of flagged items actioned | §11, `06-admin-operations-guide.md` |
| G5 | Operate the platform lawfully and trustworthily (UU PDP) with campus-appropriate scope | Data inventory complete; deletion requests honoured; no PII leaks in audits | §9, `15-privacy-and-data-retention.md` |

### 2.1 Verbatim source answers (`OQ-1`, closed by `TMU-DOC-003`)

**§B Tujuan 1–5** — `proposal.pdf §B Tujuan 1–5, p. 3`, transcribed in
`docs/_source/proposal-extract.md` (status `draft`, human verification pending):

> Pengembangan TemuUNAIR memiliki tujuan sebagai berikut:
>
> 1. Mengembangkan sistem informasi terintegrasi untuk mengelola pelaporan barang hilang dan
>    barang ditemukan di lingkungan Universitas Airlangga.
> 2. Merancang mekanisme pencarian dan pencocokan barang berdasarkan atribut informasi yang
>    meliputi foto, deskripsi, kategori, lokasi, dan waktu kejadian.
> 3. Mengintegrasikan proses verifikasi kepemilikan dan pengembalian barang ke dalam suatu alur
>    sistem yang terdokumentasi.
> 4. Menghasilkan mekanisme pengelolaan data dan status laporan yang memungkinkan proses
>    pelaporan, pencocokan, verifikasi, dan pengembalian barang dapat dipantau secara sistematis.
> 5. Menghasilkan prototype TemuUNAIR sebagai solusi berbasis teknologi informasi yang dapat
>    diimplementasikan dan dikembangkan lebih lanjut untuk

`OPEN QUESTION` **OQ-6** (new, source fidelity): Tujuan 5 ends mid-sentence
("…dikembangkan lebih lanjut untuk") in the source PDF itself — see
`docs/_source/proposal-extract.md` § OPEN QUESTIONs; a human must compare the original document.
G1–G5 above are product restatements, **not** the PDF's wording; where a claim needs source
authority, quote this section or the extract with its `proposal.pdf §…` citation.

**§D *Cara Kerja* 8 steps** — `proposal.pdf §D figure, p. 4` (the 8-box flow; the "8 steps"
count OQ-1 refers to — the PDF's prose §D lists 7 steps, both are transcribed in the extract):

> 1. Login — Pengguna masuk menggunakan identitas UNAIR.
> 2. Lapor — Pengguna memilih kehilangan atau menemukan barang, kemudian mengisi informasi dan
>    mengunggah foto.
> 3. Simpan Data — Sistem menyimpan laporan ke dalam database.
> 4. Smart Matching — Sistem mencocokkan laporan berdasarkan kemiripan foto, deskripsi,
>    kategori, lokasi, dan waktu.
> 5. Notifikasi — Jika ada kecocokan, sistem mengirim notifikasi kepada pengguna terkait.
> 6. Verifikasi — Pengguna yang terkait berkomunikasi melalui sistem untuk verifikasi
>    kepemilikan barang.
> 7. Barang Dikembalikan — Setelah verifikasi berhasil, barang dikembalikan kepada pemiliknya.
> 8. Resolved — Laporan diperbarui menjadi Returned/Resolved.

## 3. Non-goals (MVP)

Native mobile apps · payments/rewards · automatic item release · public anonymous browsing ·
phone-number sharing · voice/video chat · multi-university tenancy · fine-tuning YOLO/CLIP
(stretch only). See Blueprint §1.4.

## 4. Personas

| ID | Persona | Primary jobs | Success looks like |
|---|---|---|---|
| `P-LOSER` | Student/staff who lost something | Report fast, get notified on a match, prove ownership, get the item back | Item returned without calling a stranger |
| `P-FINDER` | Student/staff who found something | Report with photo + custody, keep custody private-ish, verify the owner | Item handed over with confidence it went to the right person |
| `P-ADMIN` | Campus admin/moderator (added; PDF only says "admin", DEC-006) | Verify reports, resolve disputes, manage drop points, keep the service trustworthy | Queue empty, disputes resolved with a record |

Details: `03-personas.md`.

## 5. Scope by release

| Release | Contents | Milestone |
|---|---|---|
| **MVP** | AUTH (domain-restricted), REPORT (lost+found, photos, custody, hidden-detail hints), SEARCH (text+image+filters), MATCH (AI suggestions, STRONG/POSSIBLE), CLAIM (challenge → approve/reject → handover → returned), CHAT (text, polling), NOTIFICATION (in-app + email), MANAGE (my reports, cancel/renew), ADMIN (queue, flags, users, places, audit), i18n id/en, privacy controls | M3–M8 |
| **v1** | SSE chat, batch digest tuning, ML model refresh, analytics dashboard, refined eval, accessibility audit fixes | M9+ |
| **Later / stretch** | OCR "notify owner by name/NIM" (needs legal review, DEC-014), YOLO fine-tuning on campus classes (DEC-015), native app, multi-campus tenancy | post-launch |

## 6. Features (MoSCoW)

| ID | Feature | Priority | PDF source | Modules |
|---|---|---|---|---|
| F1 | *Pelaporan Barang* — report lost/found with photos, place, time, custody, hints | **Must** | Fitur 1 | REPORT, UPLOAD |
| F2 | *Pencarian & Pencocokan Barang* — browse/search + AI matching | **Must** | Fitur 2 | SEARCH, MATCH |
| F3 | *Komunikasi & Pengembalian Barang* — verification challenge, chat, handover | **Must** | Fitur 3 | CLAIM, CHAT, HANDOVER |
| F4 | *Manajemen Laporan* + admin verification/moderation | **Must** | Fitur 4 | MANAGE, ADMIN |
| — | Login with UNAIR identity | **Must** | Cara Kerja 1 | AUTH |
| — | Notifications | **Must** | Cara Kerja 5 | NOTIFICATION |
| — | Sensitive-item protection (masking, ≥2 hints) | **Must** | DEC-014 | REPORT, CLAIM |
| — | Analytics for success metrics | **Should** | §11 | ANALYTICS |
| — | OCR owner notification | **Won't (this release)** | DEC-014 stretch | — |
| — | YOLO fine-tuning | **Won't (this release)** | DEC-015 stretch | — |

## 7. Success metrics

See `11-success-metrics.md`. Headline: activation (first report within 24 h of login),
report→match rate, time-to-return (median days), precision@k on the eval set, claim success
rate, % of returns completed with two-sided confirmation.

## 8. Assumptions

1. UNAIR Google Workspace (or equivalent) accounts are available and their domains are known
   (DEC-001 — **unconfirmed**, `AUTH_ALLOWED_DOMAINS`).
2. Campus network/CPU-only hosting is sufficient at campus scale (DEC-011).
3. Drop points exist at security posts and their real list can be obtained (DEC-005).
4. Bahasa Indonesia is the default language of reports (DEC-008).
5. Users have smartphones with cameras and reasonable connectivity between classes.

## 9. Dependencies

| Dependency | Owner | Needed by | Fallback |
|---|---|---|---|
| Real UNAIR email domains | UNAIR DTI / advisor | M3 (AUTH) | Dev allowlist + magic link for testers (DEC-001) |
| Real drop points + hours | UNAIR stakeholders | M3 (seed data) | Synthetic drop points flagged "contoh" |
| Google OAuth client credentials | Team | M3 | Dev-only magic-link provider |
| Proposal PDF in `docs/_source/` (committed) + logo (placeholder tracked; real palette TMU-DSG-001) | Team | M1 approval | Met for M1 doc approval (`TMU-DOC-002`, `SRC-README`) |
| Eval dataset (labelled lost/found pairs) | ML owner | M5 (matching quality) | Synthetic pairs; metrics marked provisional |

## 10. Risks (summary)

Full register: `09-risk-register.md`. Top: false-positive matches erode trust (RISK-001),
PII leak of sensitive items (RISK-002), fraud/false claims (RISK-003), cold start with no data
(RISK-004), YOLO class gap (RISK-005), AGPL licence (RISK-006), CPU latency (RISK-007),
SSO availability (RISK-008), moderator workload (RISK-009).

## 11. Open questions

| # | Question | Owner | Blocks |
|---|---|---|---|
| OQ-1 | **ANSWERED** (`TMU-DOC-003`): verbatim *Tujuan 1–5* and *Cara Kerja* 8 steps quoted in §2.1; full transcription in `docs/_source/proposal-extract.md` (draft — human verification pending) | spec-writer | closed |
| OQ-2 | Real UNAIR domains (DEC-001) — **deferred by DEC-021**: answer due M3 AUTH, allowlist stands meanwhile | UNAIR DTI | M3 AUTH |
| OQ-3 | Drop-point list and operating hours (DEC-005) — **deferred by DEC-022**: answer due M3 seeds, synthetic "contoh" drop points meanwhile | Stakeholders | M3 seeds |
| OQ-4 | Which sensitive categories are prohibited from public listing entirely? (DEC-014) — **deferred by DEC-023**: answer due M3 REPORT, DEC-014 masking rules stand meanwhile | Legal/DPO | M3 REPORT |
| OQ-5 | Production hosting target (DEC-011) — **deferred by DEC-024**: answer due M9 deploy, DEC-011 Compose/CPU default stands meanwhile | Advisor | M9 deploy |
| OQ-6 | Tujuan 5 ends mid-sentence in the source PDF ("…dikembangkan lebih lanjut untuk") — what completes it? (source-fidelity question flagged by `TMU-DOC-002`; see extract OPEN QUESTIONs) | human (source verification) | extract sign-off |
