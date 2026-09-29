---
id: FLOWS
title: User flows
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["IA", "US", "05A.6-state-machines"]
source_refs: ["proposal.pdf §Cara Kerja (pending extract)", "Blueprint §5A.6"]
---

# User flows

Mermaid flows mirroring the PDF's 8-step "Cara Kerja". Each flow cites the state machine rows
(R1–R12, C1–C9) it drives.

## 1. Login (PDF step 1)

```mermaid
flowchart LR
  A[Landing] --> B[Masuk dengan akun UNAIR]
  B --> C[Google OAuth]
  C -->|domain allowed| D[/home/]
  C -->|domain not allowed| E[/auth/error: akun harus UNAIR/]
  D --> F[Set locale/preferences - optional]
```

## 2. Report lost (R1)

```mermaid
flowchart TD
  S[Home: Saya Kehilangan] --> C1[1 Kategori]
  C1 --> C2[2 Foto opsional]
  C2 --> C3[3 Detail: judul, deskripsi, warna, merek]
  C3 --> C4[4 Di mana & kapan]
  C4 --> R[5 Tinjau & kirim]
  R --> D{Ada laporan ditemukan mirip?}
  D -->|ya| P[Pratinjau SRC-01 - lihat dulu]
  D -->|tidak| OK[Sukses: kami beri tahu jika ada kecocokan]
  P --> OK
  OK --> M[/reports/id/matches/ menunggu kecocokan]
```

## 3. Report found (R1)

```mermaid
flowchart TD
  S[Home: Saya Menemukan] --> C1[1 Kategori]
  C1 --> C2[2 Foto wajib ≥1]
  C2 --> C3[3 Detail]
  C3 --> C4[4 Di mana & kapan]
  C4 --> C5[5 Penitipan: saya bawa / titik penitipan]
  C5 --> C6[6 Pertanyaan verifikasi ≥1, ≥2 jika sensitif]
  C6 --> R[7 Tinjau & kirim]
  R --> OK[Sukses + bagikan tautan ke teman - opsional]
```

## 4. Match review (R2, R3)

```mermaid
flowchart LR
  N[Notifikasi kecocokan] --> M[/reports/id/matches/]
  M --> V[Lihat alasan: foto, teks, lokasi, waktu]
  V -->|bukan barang saya| X[Dismiss - tidak disarankan lagi]
  V -->|mungkin barang saya| C[/claims/new?reportId=/]
  V -->|saya penemu, mau menawarkan| I[Kirim undangan ke pemilik laporan hilang]
```

## 5. Claim + verification (C1–C5, R4)

```mermaid
flowchart TD
  C[/claims/new/] --> H[Tampilkan pertanyaan penemu]
  H --> A[Jawab 1-3 pertanyaan + catatan]
  A --> SUB[Klaim terkirim + chat terbuka]
  SUB --> F{Penemu menilai}
  F -->|setuju| AP[Disetujui - laporan IN_VERIFICATION]
  F -->|tolak + alasan| RJ[Ditolak - klaim lain bisa mencoba]
  AP --> CHAT[Chat & rencanakan serah terima]
  RJ --> DIS{Pemilik tidak setuju?}
  DIS -->|ya| DSP[Sengketa ke moderator]
```

## 6. Handover and return (C6, R6)

```mermaid
flowchart LR
  AP[Klaim disetujui] --> PLAN[Isi rencana: tempat, waktu, catatan]
  PLAN --> MEET[Serah terima fisik di tempat aman/titik penitipan]
  MEET --> CF[Pemilik konfirmasi]
  CF --> FF[Penemu konfirmasi]
  FF --> RET[Klaim SELESAI - kedua laporan DIKEMBALIKAN]
  RET --> N[Notifikasi kedua pihak + ajakan bagikan cerita - opsional]
```

## 7. Admin moderation (R10–R12)

```mermaid
flowchart TD
  Q[/admin/reports/] --> F[Flag ≥2 atau laporan PENDING_REVIEW]
  F --> RV{Tinjau: foto, teks, jawaban verifikasi}
  RV -->|valid| AP[Setujui → OPEN]
  RV -->|melanggar| RM[Hapus + alasan → REMOVED]
  RM --> RST{Admin memulihkan?}
  RST -->|ya| RES[Restore → OPEN]
  Q2[/admin/claims/] --> DSP[Klaim DISPUTED]
  DSP --> DEC[Keputusan: setujui/tolak + catatan]
  DEC --> AUD[Catatan audit]
```

## 8. Dispute resolution (C5)

```mermaid
flowchart LR
  D[Pihak menekan Sengketa + alasan] --> Q[Antrian moderator]
  Q --> REV[Moderator membaca jawaban + riwayat chat]
  REV --> DEC{Setuju klaim?}
  DEC -->|ya| A[APPROVED → lanjut serah terima]
  DEC -->|tidak| R[REJECTED + catatan]
  A --> AUD[Audit]
  R --> AUD
```

## Edge flows

| Case | Behaviour |
|---|---|
| Report edited after a match | Text/image change → `report.process` re-run → matches recomputed (R2 again) |
| Claim expires (C8) | 48 h reminder → 72 h `EXPIRED`; report returns to `OPEN`/`MATCHED`; claimant notified |
| Both parties stall after approval (C9) | One-sided confirmation > 72 h → `DISPUTED`, never auto-complete |
| Sensitive item (DEC-014) | Public view masked + generalized; claim requires ≥2 hints; moderator can see the challenge |
| Account deleted mid-claim | Active claims stay for the counterpart with the display name anonymized; audit stubs remain |
| ML unavailable | Report stays usable; processing marked `needs_reprocess`; retried by the worker |
