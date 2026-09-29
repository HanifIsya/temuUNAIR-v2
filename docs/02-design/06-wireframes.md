---
id: WIREFRAMES
title: Wireframes
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["IA", "FLOWS", "CMP"]
source_refs: ["Blueprint §4.3", "FE-01", "FE-03"]
---

# Wireframes

ASCII wireframes for the MVP screens, mobile (360 px) first, desktop noted where it differs.
Component IDs reference `08-component-inventory.md`. These are structure, not visual design.

## `/home` — dashboard (mobile)

```
┌───────────────────────────────┐
│ [logo]                [bell 3]│
│                               │
│ Halo, Budi                    │  h1
│ Apa yang terjadi hari ini?    │
│                               │
│ ┌───────────────────────────┐ │
│ │  🔍  Saya Kehilangan      │ │  primary CTA (blue)
│ │      Barang saya hilang   │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │  🎒  Saya Menemukan       │ │  accent CTA
│ │      Saya menemukan barang│ │
│ └───────────────────────────┘ │
│                               │
│ Laporan saya (2)         Lihat│
│ ┌───────────────────────────┐ │
│ │ [img] Tas biru   [AKTIF]  │ │  ReportCard variant=mine
│ │ Kampus B · 2 hari lalu    │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ [img] Dompet     [COCOK 1]│ │
│ └───────────────────────────┘ │
│                               │
│ Kecocokan terbaru             │
│ ┌───────────────────────────┐ │
│ │ 92% mirip → [KEMUNGKINAN] │ │  MatchCard (band, no score shown)
│ │ Kenapa? Foto & lokasi mirip│ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│ Beranda  Cari  (+)  Klaim Akun│  bottom nav
└───────────────────────────────┘
```

Desktop: two-column — CTAs left, my reports + matches right; top nav with bell + avatar.

## `/reports/new` — wizard shell

```
┌───────────────────────────────┐
│ ← Batal       Langkah 3/5     │
│ ●─●─○─○─○                     │  StatusStepper
│                               │
│ Detail barang                 │  step heading (focus target)
│                               │
│ Judul *                       │
│ [Tas ransel biru          ] 80│
│                               │
│ Deskripsi *                   │
│ [Tas ransel biru tua, ada  ]  │
│ [gantungan kunci kuning... ]  │  char counter 1000
│                               │
│ Warna (maks 3)                │
│ [Biru] [Hitam] [+ tambah]     │
│                               │
│ Merek (opsional)              │
│ [Eiger                    ]   │
│                               │
│           [Kembali] [Lanjut]  │
└───────────────────────────────┘
```

LOST steps: Kategori → Foto → Detail → Lokasi & waktu → Tinjau.
FOUND steps: Kategori → Foto ≥1 → Detail → Lokasi & waktu → Penitipan → Pertanyaan → Tinjau.

## `/reports` — browse (mobile)

```
┌───────────────────────────────┐
│ [🔍 Cari: tas biru        ]   │  search input + camera icon (image search)
│ [Kampus ▾][Kategori ▾][Waktu▾]│  FilterBar chips → sheet
│ 24 hasil                      │
│ ┌───────────┐ ┌───────────┐   │
│ │  [foto]   │ │  [foto]   │   │  ReportGrid 2-col
│ │ Tas biru  │ │ Dompet    │   │
│ │ Kampus B  │ │ Kampus A  │   │
│ │ 2 hari    │ │ 5 hari    │   │
│ └───────────┘ └───────────┘   │
│ [Muat lebih banyak]           │  explicit button + infinite scroll
└───────────────────────────────┘
```

Desktop: 4 columns + left filter panel.

## `/reports/[id]` — detail

```
┌───────────────────────────────┐
│ ← Kembali            [⋯ menu] │
│ ┌───────────────────────────┐ │
│ │        [foto besar]       │ │  ImageGallery (masked = non-zoomable)
│ └───────────────────────────┘ │
│ [DITEMUKAN] [AKTIF]   [sensitif]│  StatusBadge + SensitiveNotice
│ Tas ransel biru tua           │  h1
│ Kampus B · Perpustakaan       │
│ Ditemukan: 2 hari lalu        │
│ Dititipkan di Pos Keamanan FIKKIA│
│ Deskripsi ...                 │
│ Dilaporkan oleh: Budi S.      │  first name + initial
│                               │
│ ┌───────────────────────────┐ │
│ │ Ini barang saya → Klaim   │ │  primary (hidden for own report)
│ └───────────────────────────┘ │
│ [Laporkan laporan ini]        │  FlagDialog
└───────────────────────────────┘
```

## `/claims/[id]` — claim room (mobile)

```
┌───────────────────────────────┐
│ ← Klaim #018f…        [⋯]     │
│ ●─●─○─○  Diajukan Disetujui   │  StatusStepper
│ Serah terima  Verifikasi      │
│ ┌───────────────────────────┐ │
│ │ Jawaban pemilik vs jawaban│ │  AnswerCompare
│ │ kamu (hanya penemu/mod)   │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ Pesan                     │ │  ChatThread (aria-live polite)
│ │ Budi: Saya di kampus B    │ │
│ │ Kamu: Oke, jam 3 di pos   │ │
│ └───────────────────────────┘ │
│ [Tulis pesan…            ] ➤ │  ChatComposer
│ ┌───────────────────────────┐ │
│ │ Rencana: Pos FIKKIA, 15:00│ │  HandoverPanel
│ │ [Ubah] [Konfirmasi serah] │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

## `/admin/reports` — moderation queue (desktop)

```
┌──────────┬────────────────────────────────────────────┐
│ Ringkasan│ Antrian moderasi (7)      [filter ▾] [cari]│
│ Laporan ◀│ ┌────────────────────────────────────────┐ │
│ Klaim    │ │ [img] KTM ditemukan  [PENDING] 2 flag  │ │
│ Pengguna │ │ Kampus A · dilaporkan 1 jam lalu       │ │
│ Lokasi   │ │ [Tinjau]                               │ │
│ Audit    │ └────────────────────────────────────────┘ │
│          │ ┌────────────────────────────────────────┐ │
│          │ │ [img] Dompet hitam   [PENDING] 2 flag  │ │
│          │ └────────────────────────────────────────┘ │
└──────────┴────────────────────────────────────────────┘
  ModerationDrawer opens on the right: photo, text, flags, hint answers,
  [Setujui] [Hapus + alasan] [Pulihkan (admin)]
```

## State screens (all pages)

| Screen | Skeleton | Empty | Error |
|---|---|---|---|
| Lists | card skeletons ×3 | `EmptyState` + CTA | `ErrorState` with requestId + Retry |
| Detail | photo + text skeleton | — | `ErrorState` / `NOT_FOUND` page |
| Claim room | bubble skeletons | "Belum ada pesan" + starter tips | `ErrorState`, composer disabled |
| Admin | table skeleton | "Antrian kosong 🎉" | `ErrorState` |
