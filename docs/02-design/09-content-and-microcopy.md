---
id: COPY
title: Content and microcopy (id-ID with English mirror)
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["DESIGN-PRINCIPLES", "GLOSSARY", "FE-08"]
source_refs: ["Blueprint §4.3", "DEC-008"]
---

# Content and microcopy

Canonical copy source for `apps/web/src/i18n/messages/{id,en}.json`. Tone: warm, plain, calm;
address the user as **kamu** (not "Anda") in Indonesian; short sentences; no jargon, no blame.

## Voice principles

| Principle | Do | Don't |
|---|---|---|
| Plain language | "Barang kamu hilang?" | "Silakan lakukan pengisian formulir" |
| Calm in errors | "Koneksi bermasalah. Coba lagi ya." | "ERROR 500 — Internal Server Error" |
| Honest about AI | "Kami menemukan kemungkinan kecocokan" | "Barang kamu pasti ditemukan!" |
| Privacy-forward | "Jawaban ini tidak ditampilkan ke publik" | "Isi nomor HP agar cepat dihubungi" |
| Safety | "Bertemu di area kampus yang ramai" | "Ketemuan di mana saja" |

## Global strings

| Key | id | en |
|---|---|---|
| `app.name` | TemuUNAIR | TemuUNAIR |
| `app.tagline` | Hilang hari ini, ketemu bersama | Lost Today, Found Together |
| `common.save` | Simpan | Save |
| `common.cancel` | Batal | Cancel |
| `common.back` | Kembali | Back |
| `common.next` | Lanjut | Next |
| `common.retry` | Coba lagi | Try again |
| `common.loadMore` | Muat lebih banyak | Load more |
| `common.loading` | Memuat… | Loading… |
| `common.optional` | opsional | optional |
| `common.required` | wajib | required |
| `common.close` | Tutup | Close |
| `common.copy` | Salin | Copy |
| `common.copied` | Tersalin | Copied |
| `common.offline` | Kamu sedang offline | You are offline |
| `common.unknownError` | Terjadi kesalahan. Coba lagi ya. | Something went wrong. Try again. |

## Report wizard

| Key | id | en |
|---|---|---|
| `report.wizard.title.lost` | Lapor barang hilang | Report a lost item |
| `report.wizard.title.found` | Lapor barang ditemukan | Report a found item |
| `report.wizard.step.category.title` | Pilih kategori | Choose a category |
| `report.wizard.step.photos.title` | Tambah foto | Add photos |
| `report.wizard.step.photos.hint` | Foto membantu pencocokan. Jangan tampilkan data pribadi. | Photos help matching. Do not show personal data. |
| `report.wizard.step.details.title` | Detail barang | Item details |
| `report.wizard.step.where.title` | Di mana dan kapan | Where and when |
| `report.wizard.step.custody.title` | Barang sekarang di mana? | Where is the item now? |
| `report.wizard.step.custody.held` | Saya bawa | I am holding it |
| `report.wizard.step.custody.dropPoint` | Saya titipkan di titik penitipan | I left it at a drop point |
| `report.wizard.step.hints.title` | Pertanyaan verifikasi | Verification questions |
| `report.wizard.step.hints.hint` | Buat pertanyaan yang hanya diketahui pemilik asli. | Write questions only the real owner can answer. |
| `report.wizard.step.hints.warning` | Jangan tulis jawaban di foto atau deskripsi. | Never put the answers in photos or the description. |
| `report.wizard.step.review.title` | Periksa kembali | Review |
| `report.wizard.success` | Laporan terkirim. Kami akan memberi tahu jika ada kecocokan. | Report submitted. We will tell you if there is a match. |
| `report.wizard.duplicate.hint` | Ada laporan yang mirip. Mungkin barangmu sudah ditemukan? | Similar reports exist. Maybe your item was already found? |

## Browse and detail

| Key | id | en |
|---|---|---|
| `browse.search.placeholder` | Cari barang, merek, warna… | Search items, brands, colours… |
| `browse.empty` | Tidak ada hasil | No results |
| `browse.empty.hint` | Coba hapus filter atau buat laporan baru. | Try clearing filters or create a new report. |
| `report.detail.claim` | Ini barang saya | This is my item |
| `report.detail.masked` | Foto disamarkan untuk melindungi pemilik | Photo is masked to protect the owner |
| `report.detail.sensitive` | Barang sensitif — data pribadi disembunyikan | Sensitive item — personal data hidden |
| `report.detail.custody.dropPoint` | Dititipkan di {name} | Left at {name} |

## Matches

| Key | id | en |
|---|---|---|
| `matches.title` | Kecocokan untuk laporan ini | Matches for this report |
| `matches.empty` | Belum ada kecocokan — kami terus mencari | No matches yet — we keep searching |
| `matches.rematch` | Periksa ulang | Check again |
| `matches.dismiss` | Bukan ini | Not this one |
| `match.band.STRONG` | Sangat mungkin | Very likely |
| `match.band.POSSIBLE` | Mungkin | Possibly |
| `match.reason.IMAGE_SIMILAR` | Foto mirip | Photos are similar |
| `match.reason.TEXT_SIMILAR` | Deskripsi mirip | Descriptions are similar |
| `match.reason.COLOR_MATCH` | Warna cocok | Colours match |
| `match.reason.BRAND_MATCH` | Merek cocok | Brands match |
| `match.reason.SAME_BUILDING` | Lokasi berdekatan | Nearby location |
| `match.reason.SAME_CAMPUS` | Satu kampus | Same campus |
| `match.reason.TIME_CLOSE` | Waktu berdekatan | Times are close |
| `match.reason.CATEGORY_MATCH` | Kategori sama | Same category |

## Claims, chat, handover

| Key | id | en |
|---|---|---|
| `claim.new.title` | Buktikan ini barang kamu | Prove this is your item |
| `claim.new.submit` | Kirim klaim | Submit claim |
| `claim.new.attempts` | Sisa percobaan hari ini: {n} | Remaining attempts today: {n} |
| `claim.room.approve` | Setujui | Approve |
| `claim.room.reject` | Tolak | Reject |
| `claim.room.reject.reason` | Alasan penolakan | Reason for rejection |
| `claim.room.dispute` | Ajukan sengketa | Open a dispute |
| `claim.room.handover.plan` | Atur serah terima | Plan the handover |
| `claim.room.handover.confirm` | Konfirmasi serah terima | Confirm handover |
| `claim.room.handover.waitingOther` | Menunggu konfirmasi pihak lain | Waiting for the other party |
| `claim.room.safety` | Bertemu di area kampus yang ramai dan siang hari. | Meet in a busy campus area during the day. |
| `chat.placeholder` | Tulis pesan… | Write a message… |
| `chat.empty` | Belum ada pesan | No messages yet |

## Notifications (email + in-app)

| Key | id | en |
|---|---|---|
| `notification.MATCH_SUGGESTED.title` | Ada kecocokan untuk laporanmu | There is a match for your report |
| `notification.MATCH_SUGGESTED.body` | Kami menemukan laporan yang mirip. Buka untuk melihat. | We found a similar report. Open to review. |
| `notification.CLAIM_SUBMITTED.title` | Seseorang mengklaim barang temuanmu | Someone claimed your found item |
| `notification.CLAIM_APPROVED.title` | Klaim kamu disetujui | Your claim was approved |
| `notification.CLAIM_REJECTED.title` | Klaim kamu belum bisa disetujui | Your claim could not be approved |
| `notification.MESSAGE_RECEIVED.title` | Pesan baru | New message |
| `notification.REPORT_EXPIRING.title` | Laporanmu akan kedaluwarsa | Your report is expiring |
| `notification.REPORT_RETURNED.title` | Barang sudah kembali! | The item is back! |
| `notification.ADMIN_DISPUTE.title` | Sengketa baru perlu ditinjau | A new dispute needs review |

## Error messages (one per `error.<code>`)

| Key | id | en |
|---|---|---|
| `error.AUTH_REQUIRED` | Silakan masuk dulu. | Please sign in first. |
| `error.AUTH_DOMAIN_NOT_ALLOWED` | Gunakan akun UNAIR kamu. | Please use your UNAIR account. |
| `error.ACCOUNT_SUSPENDED` | Akun kamu sedang ditangguhkan. Hubungi admin. | Your account is suspended. Contact an admin. |
| `error.FORBIDDEN` | Kamu tidak punya akses ke sini. | You do not have access here. |
| `error.NOT_FOUND` | Tidak ditemukan. | Not found. |
| `error.VALIDATION_FAILED` | Ada isian yang perlu diperbaiki. | Some fields need fixing. |
| `error.CONFLICT_STATE` | Data sudah berubah. Muat ulang ya. | The data changed. Please reload. |
| `error.IDEMPOTENCY_CONFLICT` | Permintaan berbeda dengan yang sebelumnya. | This request differs from the previous one. |
| `error.CLAIM_ALREADY_ACTIVE` | Kamu sudah punya klaim aktif untuk barang ini. | You already have an active claim for this item. |
| `error.CLAIM_LIMIT_EXCEEDED` | Batas klaim hari ini tercapai. Coba besok. | Daily claim limit reached. Try tomorrow. |
| `error.REPORT_NOT_CLAIMABLE` | Barang ini belum bisa diklaim. | This item cannot be claimed right now. |
| `error.SELF_CLAIM_NOT_ALLOWED` | Kamu tidak bisa mengklaim laporan sendiri. | You cannot claim your own report. |
| `error.UPLOAD_INVALID_TYPE` | Format file tidak didukung. | Unsupported file type. |
| `error.UPLOAD_TOO_LARGE` | Ukuran foto terlalu besar (maks 8 MB). | Photo too large (max 8 MB). |
| `error.UPLOAD_LIMIT_REACHED` | Maksimal 5 foto per laporan. | Maximum 5 photos per report. |
| `error.RATE_LIMITED` | Terlalu banyak percobaan. Tunggu sebentar. | Too many attempts. Wait a moment. |
| `error.ML_UNAVAILABLE` | Pencocokan sedang sibuk. Kami coba lagi nanti. | Matching is busy. We will retry later. |
| `error.INTERNAL` | Terjadi kesalahan di sisi kami. | Something went wrong on our side. |

## Safety and sensitive items

| Key | id | en |
|---|---|---|
| `safety.handover.title` | Tips serah terima | Handover tips |
| `safety.handover.point1` | Bertemu di tempat ramai di area kampus. | Meet in a busy place on campus. |
| `safety.handover.point2` | Bawa teman kalau bisa. | Bring a friend if you can. |
| `safety.handover.point3` | Gunakan titik penitipan untuk barang berharga. | Use a drop point for valuables. |
| `sensitive.notice.title` | Barang sensitif | Sensitive item |
| `sensitive.notice.body` | Foto disamarkan dan deskripsi diringkas. Untuk KTM/kartu ATM, serahkan ke titik penitipan. | Photos are masked and the description is generalized. For ID/ATM cards, hand it to a drop point. |

## Empty states

| Key | id | en |
|---|---|---|
| `empty.reports` | Belum ada laporan | No reports yet |
| `empty.matches` | Belum ada kecocokan | No matches yet |
| `empty.claims` | Belum ada klaim | No claims yet |
| `empty.notifications` | Belum ada notifikasi | No notifications yet |
| `empty.adminQueue` | Antrian kosong 🎉 | Queue is empty 🎉 |

## Notes

- Every key exists in both `id.json` and `en.json`; CI (`i18n:check`) fails on mismatch.
- Placeholders use ICU syntax (`{name}`, `{n}`) with plural forms where needed.
- Never concatenate sentences in code; use full keys.
