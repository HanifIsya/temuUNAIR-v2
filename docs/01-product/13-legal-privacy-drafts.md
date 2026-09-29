---
id: LEGAL
title: Legal and privacy drafts (privacy notice, terms, community guidelines, UU PDP mapping)
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["NFR", "DECISIONS"]
source_refs: ["DEC-017", "DEC-014", "UU PDP — Law No. 27/2022", "Blueprint §9"]
---

# Legal and privacy drafts

> **REQUIRES HUMAN LEGAL REVIEW BEFORE LAUNCH (DEC-017, RISK-012).** These are engineering
> drafts, not legal advice. A qualified reviewer (UNAIR legal / DPO) must approve or amend
> before the platform is opened to real users. Anything below marked `OPEN` is unresolved.

## 1. Data inventory (what we collect and why)

| Data | Purpose (limited) | Basis | Retention | Sensitivity |
|---|---|---|---|---|
| Name, email, locale | Identity, contact about a claim | Consent / legitimate campus service | Until account deletion + cool-off | PII |
| `unair_ref` (NIM/NIP, optional) | Dispute resolution only; never exposed | Consent | Same as account | PII (high) |
| Report content (title, description, colors, brand) | Matching and discovery | Consent | `REPORT_TTL_DAYS` + grace, then expired (content retained for audit minimal) | may contain PII — guidance required |
| Photos | Matching and verification | Consent | Until report deletion + media cleanup | may contain faces/IDs — masking for sensitive |
| Location (campus, building, optional geo) | Matching and safety | Consent | Same as report | exact geo hidden for sensitive |
| Verification hints (prompt + answer) | Ownership verification | Consent | Until report removal + retention | **encrypted at rest (AES-GCM)** |
| Claims, chat messages | Coordination of return | Consent | Claim lifecycle + retention policy | parties + moderators only |
| Audit logs | Accountability | Legitimate interest / legal | 12 months | no hint answers; IP hashed |
| Notifications | Service messages | Consent (email opt-out) | 6 months | minimal |

`OPEN`: final retention numbers for chat and audit logs, and whether `unair_ref` should be
collected at all (data minimisation says: only collect it when a dispute needs it).

## 2. Privacy notice (draft, `id-ID` outline)

Ringkas, dalam bahasa manusia — disetujui legal sebelum tayang:

1. **Data apa yang kami simpan** — akun (nama, email), laporan (teks, foto, lokasi, waktu),
   pertanyaan verifikasi (jawaban **terenkripsi**), klaim dan pesan, catatan audit.
2. **Untuk apa** — mencocokkan barang hilang/temuan, memverifikasi kepemilikan, mengatur serah
   terima, dan menjaga keamanan layanan. Tidak untuk iklan atau pihak ketiga.
3. **Siapa yang bisa melihat** — foto/deskripsi publik hanya untuk pengguna yang sudah masuk;
   item sensitif disamarkan; jawaban verifikasi hanya untuk penemu dan moderator.
4. **Berapa lama** — laporan kedaluwarsa setelah 90 hari (masa perpanjangan 30 hari); pesan
   mengikuti siklus klaim; log audit 12 bulan.
5. **Hak kamu** — akses, koreksi, hapus akun (anonymisasi setelah 7 hari), batalkan email
   notifikasi, dan ajukan keluhan ke admin.
6. **Keamanan** — enkripsi jawaban verifikasi, penghapusan EXIF/GPS, akses berbasis peran,
   pembatasan laju, dan pencatatan aksi admin.
7. **Kontak** — `OPEN`: alamat surel DPO/kampus yang resmi.

English mirror: to be produced with the same structure.

## 3. Terms of service (draft outline)

- Eligibility: civitas akademika with an allowed UNAIR email domain (DEC-001).
- Acceptable use: no false claims (fraud), no harassment, no doxxing (posting others' personal
  data), no scraping, no commercial use.
- **No guarantee of recovery** — AI suggestions are advisory (DEC-012); the platform is not
  liable for items not returned, nor for items lost during a handover.
- Safety: meet in busy campus areas; never share banking/OTP details; use drop points when
  possible.
- Enforcement: flags → moderation → suspension; audit trail kept.
- Changes: notice via in-app notification; continued use = acceptance.

## 4. Community guidelines (short, for `/help`)

1. Jujur: hanya klaim barang yang benar-benar milikmu.
2. Jangan unggah data pribadi orang lain (wajah, KTP/KTM orang lain, nomor telepon).
3. Untuk barang sensitif, serahkan ke titik penitipan dan sampaikan ciri umum saja.
4. Bertemu di tempat ramai, siang hari, di area kampus.
5. Laporkan konten mencurigakan lewat tombol "Laporkan".

## 5. UU PDP (Law 27/2022) mapping

| Principle | Requirement | Where implemented | Status |
|---|---|---|---|
| Lawful basis & purpose limitation | Collect only what matching/return needs | Data inventory above; `ReportCreate` schema | draft |
| Data minimisation | No NIM/NIP by default; no phone numbers; no public browsing | DEC-018, DEC-009 | design |
| Accuracy | Owner can edit reports; disputes arbitrated | FR-REP-007, FR-CLM-004 | design |
| Storage limitation | 90-day TTL, grace, media cleanup, audit 12 mo | DEC-007, `media.cleanup`, `report.expire-sweep` | design |
| Security | AES-GCM hints, EXIF strip, RBAC, rate limits, audit log | NFR-020..026, §9 | design |
| Right of access & portability | `GET /me`, owner views; export `OPEN` | API-ME-01, API-REP-03 | partial |
| Right to erasure | `DELETE /me` → 7-day cool-off → anonymize | FR-AUTH-005, `account.delete` | design |
| Accountability | Audit log, threat model, privacy review gate | §5A.11, M8 gate | design |
| Cross-border transfer | `OPEN` — hosting region and model downloads must be reviewed | DEC-011 | open |
| Children | UNAIR is higher-ed; no minors expected — state it | terms | open |

## 6. Outstanding legal items (blockers for launch)

| # | Item | Owner | Needed by |
|---|---|---|---|
| L-1 | Confirm legal basis for publishing found-item photos of third parties (e.g. a KTM) | Legal/DPO | M3 |
| L-2 | Decide whether sensitive categories may be listed publicly at all (or drop-point only) | Legal/DPO | M3 |
| L-3 | Approve privacy notice, terms, guidelines (id + en) | Legal/DPO | M8 |
| L-4 | Confirm hosting region + data transfer posture | Advisor/Legal | M9 |
| L-5 | Review OCR "notify owner by name/NIM" before any implementation (DEC-014) | Legal/DPO | stretch |
