---
id: DEMO-SCRIPT
title: Demo script (8 steps)
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["FLOWS", "SEEDS", "ROADMAP"]
source_refs: ["proposal.pdf §Cara Kerja (pending extract)", "Blueprint §4.9"]
---

# Demo script

Follows the PDF's "Cara Kerja" 8 steps. Target: **10–12 minutes**, two browsers (or two
profiles) side by side — one "loser", one "finder" — plus an admin window.

## Setup (before the audience arrives)

1. Staging running with seeded demo data (`pnpm seed`) and `ML_MODE=stub`.
2. Two browser profiles signed in: `loser@example.test`, `finder@example.test`.
3. Admin window signed in: `mod.a@example.test`.
4. Mailpit (or the email provider) open on a second monitor to show notifications.
5. Pre-seed one match so a suggestion is visible without waiting.

## The 8 steps

| # | Step | Show | Say (id) |
|---|---|---|---|
| 1 | **Login with UNAIR identity** | Google sign-in; a disallowed account is rejected | "Hanya civitas akademika UNAIR yang bisa masuk." |
| 2 | **Report a lost item** | Loser creates a LOST report in < 60 s (photo optional, quick chips for time) | "Pelaporan di bawah satu menit, bisa dilakukan sambil jalan." |
| 3 | **Report a found item** | Finder creates a FOUND report: photo, custody at a drop point, 2 verification questions | "Penemu menulis pertanyaan rahasia — jawabannya tidak pernah tampil publik." |
| 4 | **AI matching** | The match appears on the loser's screen with reasons (photo similar, same campus, time close) | "AI membandingkan foto, teks, lokasi, dan waktu. Ini saran, bukan keputusan otomatis." |
| 5 | **Notification** | Bell updates; email arrives in Mailpit | "Kedua pihak langsung diberi tahu." |
| 6 | **Verification & claim** | Loser answers the questions; finder compares answers side by side and approves | "Bukti kepemilikan tanpa membocorkan detail ke publik." |
| 7 | **Chat & handover** | Chat exchange; handover plan (drop point, time); both confirm | "Koordinasi di dalam aplikasi — tanpa bertukar nomor ponsel." |
| 8 | **Returned & moderation** | Both reports show RETURNED; switch to admin: queue, audit log entry, stats | "Barang kembali, tercatat, dan setiap tindakan admin terekam." |

## Optional add-ons (if time permits)

- Sensitive item flow: KTM report shows masking and generalized description (E2E-10).
- Expiry and renew: show an EXPIRED report being renewed (E2E-13).
- Dispute: open a dispute and resolve it as a moderator (E2E-12).
- Locale switch to English (E2E-15).

## Failure fallbacks

| Failure | Fallback |
|---|---|
| Network down | use the pre-recorded video of the same flow |
| ML slow | `ML_MODE=stub` is already on; use the pre-seeded match |
| Email provider slow | show Mailpit; the in-app bell is the primary evidence |
| A browser session expired | re-login takes 10 seconds — keep credentials handy |

## What NOT to show

- Real user data (none exists in seeds — keep it that way).
- Hint answers on screen beyond the finder's own comparison view.
- Any secret, `.env`, or admin credentials.

## Timing plan

| Minute | Content |
|---|---|
| 0–1 | Intro: problem and vision |
| 1–2 | Step 1 login |
| 2–4 | Steps 2–3 reporting |
| 4–6 | Steps 4–5 matching + notifications |
| 6–8 | Step 6 verification |
| 8–10 | Steps 7–8 chat, handover, moderation |
| 10–12 | Metrics slide (report→match, time-to-return) + Q&A |
