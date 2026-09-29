---
id: ONBOARDING
title: Onboarding and help
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["COPY", "SCR-015", "DESIGN-PRINCIPLES"]
source_refs: ["Blueprint §4.3", "DEC-014"]
---

# Onboarding and help

Goal: a first-time user can report an item confidently and knows how the return will work —
without a tutorial wall.

## First-run tour (3 steps, skippable, once per account)

| Step | Anchor | Copy (id) |
|---|---|---|
| 1 | Home CTAs | "Lapor barang hilang atau temuan dalam 1 menit." |
| 2 | "Cari" nav item | "Cari dulu — mungkin barangmu sudah ditemukan orang lain." |
| 3 | Claim flow preview | "Kalau ini barangmu, jawab pertanyaan penemu untuk membuktikannya." |

Implementation: lightweight coach marks (no modal blocking); state in `localStorage`
(`tu.onboarding.v1`) and a "Lihat lagi" link in `/help`. Never re-shows after completion.

## Contextual help

| Where | Help |
|---|---|
| Wizard photos step | Inline hint: "Jangan tampilkan data pribadi di foto." |
| Sensitive category selected | `SensitiveNotice` with masking explanation + drop-point advice |
| Hints editor | Prompt suggestions + warning "jangan tulis jawaban di foto" |
| Claim challenge | "Jawabanmu hanya dilihat penemu dan moderator." |
| Handover panel | `SafetyTipBanner` + link to `/help/safety` |
| Empty states | One-line explanation + the most useful action |

## `/help` FAQ (outline, full copy in `09-content-and-microcopy.md`)

1. **Bagaimana cara melaporkan barang?** — dua jenis laporan, langkah singkat, foto membantu.
2. **Bagaimana pencocokan bekerja?** — AI membandingkan foto, deskripsi, lokasi dan waktu;
   hasilnya saran, bukan keputusan otomatis (DEC-012).
3. **Bagaimana cara membuktikan barang itu milik saya?** — pertanyaan rahasia dari penemu;
   jawaban tidak pernah ditampilkan publik.
4. **Bagaimana serah terima yang aman?** — tempat ramai, siang hari, titik penitipan.
5. **Bagaimana dengan privasi saya?** — masking, EXIF dihapus, login diperlukan, hak hapus akun.
6. **Barang saya sensitif (KTM/ATM).** — disamarkan otomatis; serahkan ke titik penitipan;
   moderator menangani klaim.
7. **Laporan saya kedaluwarsa, apa sekarang?** — perpanjang dalam 30 hari.

## `/help/safety` guide

- Meet in busy campus areas during the day; bring a friend when possible.
- Prefer drop points for valuables and documents.
- Never share OTP, bank details or passwords — TemuUNAIR never asks for them.
- If something feels wrong: use "Ajukan sengketa" or contact a moderator.
- What moderators can and cannot see (transparency).
- Drop-point list per campus (`DropPointCard`).

## Empty-state guidance

| Screen | Message + action |
|---|---|
| Home, no reports | "Mulai dengan melaporkan barang yang hilang." → wizard |
| Browse, no results | "Coba hapus filter atau ubah kata kunci." → clear filters |
| Matches, none | "Kami terus mencari. Kamu akan diberi tahu saat ada kecocokan." → rematch |
| Claims, none | "Klaim muncul di sini setelah kamu mengajukan atau menerima klaim." → browse |
| Notifications, none | "Kabar tentang laporanmu akan muncul di sini." |

## Copy constraints

- All onboarding strings live in i18n (`id` + `en`); no images with baked-in text.
- Tour is dismissible with a visible "Lewati" and never blocks the primary CTA.
- Accessibility: coach marks are reachable by keyboard and announced; reduced-motion safe.
