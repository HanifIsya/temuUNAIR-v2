---
id: WIREFRAMES
title: Wireframes
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["IA", "FLOWS", "CMP"]
source_refs: ["Blueprint §4.3", "FE-01", "FE-03"]
---

# Wireframes

ASCII wireframes for the MVP screens, mobile (360 px) first, desktop noted where it differs.
Component IDs reference `08-component-inventory.md`. Screen specifications reference `07-screen-specs/`.

## Screen wireframe index (SCR-001..023)

| ID | Route | Screen | Wireframe coverage |
|---|---|---|---|
| SCR-001 | `/` | Landing | §`/` — Landing (mobile & desktop) |
| SCR-002 | `/login`, `/auth/error` | Login & auth error | §`/login` — Login |
| SCR-003 | `/home` | Dashboard | §`/home` — dashboard (mobile & desktop) |
| SCR-004 | `/reports/new` | Report wizard | §`/reports/new` — wizard shell |
| SCR-005 | `/reports` | Browse + search | §`/reports` — browse |
| SCR-006 | `/reports/[id]` | Report detail | §`/reports/[id]` — detail |
| SCR-007 | `/reports/[id]/edit` | Report edit | See SCR-004 wizard shell / `SCR-007-report-edit.md` |
| SCR-008 | `/reports/[id]/matches` | Matches review | §`/reports/[id]/matches` — suggestions |
| SCR-009 | `/me/reports` | My reports | See SCR-005 list variant / `SCR-009-my-reports.md` |
| SCR-010 | `/claims` | Claims list | See SCR-005 list variant / `SCR-010-claims-list.md` |
| SCR-011 | `/claims/new` | Claim challenge form | §`/claims/new` — verification challenge |
| SCR-012 | `/claims/[id]` | Claim room | §`/claims/[id]` — claim room |
| SCR-013 | `/notifications` | Notifications | §`/notifications` — notification inbox |
| SCR-014 | `/me/settings` | Settings | §`/me/settings` — profile and preferences |
| SCR-015 | `/help`, `/help/safety` | Help & safety | Static article layout / `SCR-015-help.md` |
| SCR-016 | `/privacy`, `/terms` | Legal pages | Static document layout / `SCR-016-legal.md` |
| SCR-017 | `/admin` | Admin dashboard | §`/admin` — overview dashboard |
| SCR-018 | `/admin/reports` | Admin reports queue | §`/admin/reports` — moderation queue |
| SCR-019 | `/admin/claims` | Admin claims / disputes | Table view with ModerationDrawer / `SCR-019-admin-claims.md` |
| SCR-020 | `/admin/users` | Admin users | Table view with UserDrawer / `SCR-020-admin-users.md` |
| SCR-021 | `/admin/places` | Admin places | Table view with PlaceModal / `SCR-021-admin-places.md` |
| SCR-022 | `/admin/audit` | Admin audit log | Table view with JSON inspector / `SCR-022-admin-audit.md` |
| SCR-023 | `/403`, `/404`, `/500`, `/offline` | Error pages | §State screens |

## `/` — Landing (mobile)

```
┌───────────────────────────────┐
│ [logo] TemuUNAIR       [Masuk]│  Header
│                               │
│ Hilang hari ini,              │  h1
│ ketemu bersama.               │
│                               │
│ Layanan pelaporan dan         │  subtitle
│ pencocokan barang hilang      │
│ Universitas Airlangga.        │
│                               │
│ ┌───────────────────────────┐ │
│ │ Masuk dengan akun UNAIR   │ │  primary CTA
│ └───────────────────────────┘ │
│                               │
│ ┌───┐ ┌───┐ ┌───┐             │
│ │⚡1m│ │🤖AI│ │🤝Amn│            │  3 ValueCards
│ └───┘ └───┘ └───┘             │
│                               │
│ Bantuan · Privasi · Syarat    │  Footer
└───────────────────────────────┘
```

Desktop: wide hero, 3 illustrated value pillars, preview cards.

## `/login` — Login (mobile)

```
┌───────────────────────────────┐
│ ← Kembali                     │
│                               │
│ [logo] TemuUNAIR              │
│                               │
│ Masuk ke akun kamu            │  h1
│ Gunakan email resmi UNAIR     │
│ (@*.unair.ac.id)              │
│                               │
│ ┌───────────────────────────┐ │
│ │ [G] Lanjutkan dengan Google│ │  Google OAuth button
│ └───────────────────────────┘ │
│                               │
│ [info] Hanya untuk mahasiswa, │  Info banner (DEC-001)
│ dosen, dan tenaga kependidikan│
│ Universitas Airlangga.        │
└───────────────────────────────┘
```

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

## `/reports/[id]/matches` — suggestions (mobile)

```
┌───────────────────────────────┐
│ ← Laporan saya                │
│                               │
│ Saran Kecocokan               │  h1
│ Untuk: Tas ransel biru tua    │
│                               │
│ [KEMUNGKINAN BESAR]           │  MatchCard band=STRONG
│ ┌───────────────────────────┐ │
│ │ [img] Tas ransel Eiger    │ │
│ │ Ditemukan di Kampus B     │ │
│ │ Alasan:                   │ │
│ │ • Kemiripan visual tinggi │ │
│ │ • Lokasi & waktu sesuai   │ │
│ │                           │ │
│ │ [Ini Barang Saya] [Bukan] │ │  claim / dismiss CTAs
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

## `/claims/new` — verification challenge (mobile)

```
┌───────────────────────────────┐
│ ← Kembali                     │
│                               │
│ Verifikasi Kepemilikan        │  h1
│ Jawab pertanyaan dari penemu  │
│                               │
│ 1. Apa gantungan kuncinya? *  │
│ [Boneka bebek kuning      ]   │
│                               │
│ 2. Apa isi kantong depan?     │
│ [Kunci motor & flashdisk  ]   │
│                               │
│ Catatan tambahan (opsional)   │
│ [Saya bisa ambil jam 3 sore]  │
│                               │
│ [Batal]         [Ajukan Klaim]│
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

## `/notifications` — notification inbox (mobile)

```
┌───────────────────────────────┐
│ Notifikasi         [Tandai 3] │  mark-all-read
│                               │
│ ┌───────────────────────────┐ │
│ │ 🔵 Ada kecocokan baru!    │ │  unread item
│ │ Tas ransel biru memiliki  │ │
│ │ kecocokan di Kampus B     │ │
│ │ 10 menit lalu             │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ Klaim kamu disetujui      │ │  read item
│ │ Silakan atur serah terima │ │
│ │ 2 jam lalu                │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

## `/me/settings` — profile and preferences (mobile)

```
┌───────────────────────────────┐
│ Pengaturan Akun               │  h1
│                               │
│ Nama tampilan                 │
│ [Budi Santoso             ]   │
│ Email: budi@student.unair.ac.id│
│                               │
│ Bahasa / Language             │
│ (●) Bahasa Indonesia  ( ) EN  │
│                               │
│ Notifikasi Email              │
│ [x] Beri tahu saat ada cocok  │
│ [x] Beri tahu saat klaim masuk│
│ [ ] Ringkasan mingguan        │
│                               │
│ [Simpan Perubahan]            │
│                               │
│ [Hapus Akun & Data Pribadi]   │  danger button (cool-off 7d)
└───────────────────────────────┘
```

## `/admin` — overview dashboard (desktop)

```
┌──────────┬────────────────────────────────────────────┐
│ Ringkasan│ Dashboard Admin — Kampus B                 │
│ Laporan  │                                            │
│ Klaim    │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────┐│
│ Pengguna │ │Antrian 7│ │Aktif 142│ │Klaim 12 │ │Seles││
│ Lokasi   │ └─────────┘ └─────────┘ └─────────┘ └─────┘│
│ Audit    │                                            │
│          │ Laporan Menunggu Peninjauan                │
│          │ [Tabel ringkas: ID, Judul, Pelapor, Flag]  │
└──────────┴────────────────────────────────────────────┘
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
