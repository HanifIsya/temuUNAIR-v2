---
id: SRC-EXTRACT
title: proposal.pdf extract
status: draft
owner: OR
updated: 2026-10-02
depends_on: []
source_refs: ["proposal.pdf"]
---

# Extract of `proposal.pdf` (draft — human verification pending)

Machine-extracted (text layer via `pypdf`, figures via image extraction) and transcribed by
`TMU-DOC-002` on 2026-10-02 from the committed source `docs/_source/proposal.pdf`
(SHA-256 `028501CB2CBBA3385F62F57B192D1B87C2541CF2CE58348C44E99B0BE5FBF8B9`, 8 pages, byte-identical
to the human's drop). Everything below cites `proposal.pdf §…`. Quotes are verbatim **in wording**;
transcription normalisations are limited to: inter-word/line spacing, curly → straight quotation
marks, and em-dashes joining the PDF's line-broken titles/bodies — no word is ever added, removed
or reordered. Anything absent or truncated in the source is marked `OPEN QUESTION`. **A human must
verify this extract against the PDF** (README rule: human verification flagged).

## Document metadata (cover, `proposal.pdf §cover p. 1`)

- Title: *TemuUNAIR: Sistem Informasi Pelaporan dan Pencocokan Barang Hilang Berbasis Kecerdasan
  Buatan di Lingkungan Universitas Airlangga*
- Course/context: *Kelompok 3 / Inovasi Sistem Informasi dan Teknologi I1*; S1 Sistem Informasi,
  Fakultas Sains dan Teknologi, Universitas Airlangga, 2026.
- Members (`proposal.pdf §cover p. 1`): Rizaldi Rizki Saputra, Maysha Akmala Dina Azzahra,
  Hanif Isya Annafi, Abdul Hakim Fathur Rochman. *Student ID numbers on the cover are omitted
  here deliberately (course identifiers); cite `proposal.pdf §cover p. 1` for them.*

## Section list

| § | Section | Page(s) | One-line summary |
|---|---|---|---|
| `proposal.pdf §cover` | Cover | 1 | Title, group, course, members, faculty, year. |
| `proposal.pdf §A` | LATAR BELAKANG | 2–3 | Problem: scattered, unstructured lost/found information at UNAIR; proposed integrated digital platform (report, search, match, verify, return, status management). |
| `proposal.pdf §B` | TUJUAN | 3 | Five objectives (verbatim below). |
| `proposal.pdf §C` | DESKRIPSI IDE/INOVASI | 3–4 | §C.1 Logo dan Filosofi (figure 2); §C.2 Fitur Utama — four features: Pelaporan, Pencarian & Pencocokan, Komunikasi & Pengembalian, Manajemen Laporan. |
| `proposal.pdf §D` | CARA KERJA SISTEM | 4–5 | 7 numbered prose steps + the 8-step flow figure (verbatim below). |
| `proposal.pdf §E` | TARGET PENGGUNA | 5 | All UNAIR civitas + supporting entities across Kampus A/B/C and Banyuwangi/FIKKIA; two functional roles: Loser (Pelapor Kehilangan), Finder (Pelapor Penemuan). |
| `proposal.pdf §F` | TEKNOLOGI DAN INFRASTRUKTUR | 5–6 | Three layers: Next.js/Tailwind frontend; AI/ML service (NLP → YOLO → CLIP, multimodal matching); RDBMS (MySQL/PostgreSQL). |
| `proposal.pdf §G` | TIMELINE PENGERJAAN | 6–7 | 6 weeks: Minggu 1 Perencanaan & Analisis; 2–3 Perancangan Sistem; 4 Desain & Branding; 5 Penyusunan Laporan; 6 Finalisasi. |
| `proposal.pdf §H` | PEMBAGIAN PERAN | 7 | Roles per feature (table below). |
| `proposal.pdf p. 8` | (page 8) | 8 | Blank — no text layer, no extracted figure. |

## Verbatim: §B Tujuan 1–5 (`proposal.pdf §B Tujuan 1–5, p. 3`)

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

`OPEN QUESTION` (OQ-6, source defect): **Tujuan 5 ends mid-sentence at "…lebih lanjut untuk" in
the source itself** — verified against the PDF's text layer in layout mode; section C begins
immediately after. Do not invent the continuation; a human must compare with the original
document (dated copy + ADR per README rule 1 if a correction is issued).

## Verbatim: §D Cara Kerja Sistem

Prose list (`proposal.pdf §D prose 1–7, pp. 4–5`) — **7 numbered steps**:

> 1. Login Pengguna — Pengguna masuk menggunakan identitas UNAIR.
> 2. Membuat Laporan — Pengguna memilih "Saya Kehilangan" atau "Saya Menemukan", kemudian
>    mengisi informasi barang dan mengunggah foto.
> 3. Penyimpanan Data — Sistem menyimpan laporan ke dalam database dan menampilkannya pada
>    platform.
> 4. Pencocokan Barang — Sistem mencari laporan yang memiliki kemiripan berdasarkan foto,
>    deskripsi, kategori, lokasi, dan waktu kejadian.
> 5. Notifikasi Match — Jika ditemukan kemungkinan kecocokan, sistem memberikan notifikasi
>    kepada pengguna terkait.
> 6. Komunikasi & Verifikasi — Pengguna dapat berkomunikasi untuk memastikan kesesuaian barang
>    dan melakukan verifikasi kepemilikan.
> 7. Pengembalian Barang — Setelah barang berhasil dikembalikan, laporan diperbarui menjadi
>    Returned/Resolved.

Figure list of the flow (`proposal.pdf §D figure, p. 4`, figure 3 below) — **8 numbered boxes**:

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

Observation (not an OPEN QUESTION — both renderings are present and legible): the prose list has
**7** steps, the figure has **8** (it splits "Pengembalian Barang" and "Resolved" and renames
steps 2–5). Repo references to "the PDF's *Cara Kerja* 8 steps" (e.g. `docs/01-product/01-PRD.md`
OQ-1) mean the **figure**; cite `proposal.pdf §D figure, p. 4` for 8-step references and
`proposal.pdf §D prose, pp. 4–5` for the numbered text.

## Figure list

| # | Page | File (embedded name, px) | Citation | What it is |
|---|---|---|---|---|
| 1 | 1 | `X7.png`, 300×300 | `proposal.pdf §cover p. 1` | UNAIR university emblem (cover). |
| 2 | 3 | `X14.png`, 1254×1254 | `proposal.pdf §C.1 p. 3` | **TemuUNAIR logo** under §C.1: magnifier + backpack inside a location-pin, blue/yellow organic shape, wordmark "TemuUNAIR", tagline "Lost Today, Found Together". |
| 3 | 4 | `X19.png`, 1983×793 | `proposal.pdf §D figure p. 4` | 8-step *Cara Kerja* flow diagram (Login → Lapor → Simpan Data → Smart Matching → Notifikasi → Verifikasi → Barang Dikembalikan → Resolved). |

Observation for `TMU-DSG-001` / the placeholder-logo caveat: figure 2 **is the real logo
embedded in the PDF** (tagline confirms the Blueprint's "Lost Today, Found Together"). No image
was extracted into `docs/_source/logo.png` here — replacing the placeholder is out of scope for
`TMU-DOC-002` and sits with the recorded human-gated decision (`TMU-META-004` Context).

## Verbatim: §H Pembagian Peran (`proposal.pdf §H, p. 7`)

| Nama | Peran | Tanggung Jawab |
|---|---|---|
| Rizaldi Rizki Saputra | Ketua Kelompok & PJ Fitur Pelaporan Barang | Koordinasi kelompok, latar belakang & tujuan, fitur pelaporan |
| Maysha Akmala Dina Azzahra | PJ AI/Machine Learning Service | Mekanisme pencocokan, cara kerja sistem |
| Hanif Isya Annafi | PJ Komunikasi, Pengembalian Barang & Microservice API | Alur komunikasi & verifikasi, target pengguna |
| Abdul Hakim Fathur Rochman | PJ Manajemen Laporan, Database & Desain Visual | Manajemen status laporan, logo & filosofi |

## Other verbatim anchors worth citing

- §C.2 Fitur Utama (four features, `proposal.pdf §C.2, p. 4`): *Pelaporan Barang*; *Pencarian &
  Pencocokan Barang*; *Komunikasi & Pengembalian Barang*; *Manajemen Laporan* ("…juga dapat
  digunakan oleh admin untuk melakukan verifikasi laporan tertentu.").
- §E roles (`proposal.pdf §E, p. 5`): *Pihak Pelapor Kehilangan (Loser)*; *Pihak Pelapor
  Penemuan (Finder)*.
- §F AI pipeline (`proposal.pdf §F.2, p. 6`): NLP extraction → YOLO detection ("YOLO tidak
  menentukan kesamaan barang namun fungsinya murni deteksi objek.") → OpenAI CLIP embeddings
  with cosine similarity; multimodal matching = text + visual.
- §F stack (`proposal.pdf §F.1/F.3, pp. 5–6`): Next.js (SSR/CSR), Tailwind CSS,
  RDBMS MySQL/PostgreSQL.

## OPEN QUESTIONs (source-fidelity)

| OQ | Where | Question |
|---|---|---|
| OQ-6 | `proposal.pdf §B Tujuan 5, p. 3` | Tujuan 5 ends mid-sentence ("…lebih lanjut untuk"). What completes it? (Human: compare original document.) |
| — | `proposal.pdf p. 8` | Page 8 has no text layer and no extracted figure — confirm it is intentionally blank. |

*(OQ-6 does not renumber the PRD's OQ-1..5 table; since `TMU-DOC-003` it is also registered as
its own row in `docs/01-product/01-PRD.md` §11.)*
