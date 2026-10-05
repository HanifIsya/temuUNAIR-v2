---
id: NOTIF-TEMPLATES
title: Notification and email templates
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["COPY", "BE-08", "FR-NTF"]
source_refs: ["Blueprint §5A.10"]
---

# Notification and email templates

Every `NotificationType` from the contract (`BE-08`) with in-app copy and email subject/body in
`id` and `en`. Variables in `{braces}` come from the notification payload. No PII beyond the
user's own display name; hint answers, emails and exact geo never appear.

## Delivery rules (summary of `BE-08`)

| Channel | Behaviour |
|---|---|
| In-app | Row created always; deduped by `dedupe_key`; unread count polled (30 s) |
| Email | Sent if `email_enabled` and type not muted; deduped; digest for POSSIBLE matches and unread chat |
| Quiet hours | none in MVP; digest sends at 07:00 WIB |

## Templates

### `MATCH_SUGGESTED` (report owner)
| Field | id | en |
|---|---|---|
| In-app title | Ada kemungkinan kecocokan | A possible match |
| In-app body | Kami menemukan laporan yang mirip dengan "{reportTitle}". | We found a report similar to "{reportTitle}". |
| Email subject | [TemuUNAIR] Kemungkinan kecocokan untuk laporanmu | [TemuUNAIR] A possible match for your report |
| Email body | Halo {name}, ada laporan baru yang mirip dengan laporanmu "{reportTitle}". Buka TemuUNAIR untuk melihat alasannya. | Hi {name}, a new report looks similar to yours "{reportTitle}". Open TemuUNAIR to see why. |
| CTA | Lihat kecocokan → `/reports/{reportId}/matches` | |
| Email? | STRONG: immediately · POSSIBLE: daily digest 07:00 WIB | |

### `MATCH_INVITE` (LOST owner, from finder)
| Field | id | en |
|---|---|---|
| In-app title | Seseorang mungkin menemukan barangmu | Someone may have found your item |
| Body | Penemu barang mengira ini milikmu: "{foundTitle}". | A finder thinks this might be yours: "{foundTitle}". |
| Email subject | [TemuUNAIR] Mungkin barangmu sudah ditemukan | [TemuUNAIR] Your item may have been found |
| CTA | Lihat laporan → `/reports/{foundReportId}` | |

### `CLAIM_SUBMITTED` (finder)
| Field | id | en |
|---|---|---|
| In-app title | Ada yang mengklaim barang temuanmu | Someone claimed your found item |
| Body | Seseorang menjawab pertanyaan verifikasimu untuk "{reportTitle}". | Someone answered your verification questions for "{reportTitle}". |
| Email subject | [TemuUNAIR] Klaim baru untuk barang temuanmu | [TemuUNAIR] New claim on your found item |
| CTA | Tinjau jawaban → `/claims/{claimId}` | |

### `CLAIM_APPROVED` / `CLAIM_REJECTED` (claimant)
| Field | id | en |
|---|---|---|
| Approved title | Klaim kamu disetujui 🎉 | Your claim was approved 🎉 |
| Approved body | Penemu menyetujui klaimmu. Atur serah terima di ruang klaim. | The finder approved your claim. Arrange the handover in the claim room. |
| Rejected title | Klaim kamu belum disetujui | Your claim was not approved |
| Rejected body | Alasan: {reason}. Kamu bisa mengajukan sengketa jika merasa ini keliru. | Reason: {reason}. You can open a dispute if this seems wrong. |
| Email subject | [TemuUNAIR] Keputusan klaim: {decision} | [TemuUNAIR] Claim decision: {decision} |
| CTA | Buka klaim → `/claims/{claimId}` | |

### `CLAIM_REMINDER` (finder, 48 h)
| Field | id | en |
|---|---|---|
| In-app title | Jangan lupa tinjau klaim | Do not forget to review the claim |
| Body | Klaim untuk "{reportTitle}" menunggu keputusanmu. Kedaluwarsa dalam 24 jam. | The claim for "{reportTitle}" awaits your decision. It expires in 24 hours. |
| Email subject | [TemuUNAIR] Klaim menunggu keputusanmu (24 jam) | [TemuUNAIR] A claim awaits your decision (24h) |
| CTA | `/claims/{claimId}` | |

### `MESSAGE_RECEIVED` (counterpart)
| Field | id | en |
|---|---|---|
| In-app title | Pesan baru dari {senderName} | New message from {senderName} |
| Body | Buka ruang klaim untuk membalas. | Open the claim room to reply. |
| Email | digest only if unread after 15 min (dedupe window) | |
| CTA | `/claims/{claimId}` | |

### `HANDOVER_PLANNED` / `HANDOVER_CONFIRMED` (counterpart)
| Field | id | en |
|---|---|---|
| Planned title | Rencana serah terima diatur | Handover planned |
| Planned body | {place} · {at} (WIB). Cek detailnya. | {place} · {at} (WIB). Check the details. |
| Confirmed title | Serah terima dikonfirmasi | Handover confirmed |
| Confirmed body | Satu pihak sudah konfirmasi. Konfirmasi kamu dibutuhkan. | One side confirmed. Your confirmation is needed. |
| CTA | `/claims/{claimId}` | |

### `REPORT_RETURNED` (both parties)
| Field | id | en |
|---|---|---|
| In-app title | Barang sudah kembali! | The item is back! |
| Body | Klaim selesai dan barang sudah diserahkan. Terima kasih sudah jujur. | The claim is complete and the item was handed over. Thank you for being honest. |
| Email subject | [TemuUNAIR] Selesai — barang sudah dikembalikan | [TemuUNAIR] Done — the item was returned |
| CTA | `/claims/{claimId}` | |

### `REPORT_EXPIRING` / `REPORT_EXPIRED` (owner)
| Field | id | en |
|---|---|---|
| Expiring title | Laporanmu akan kedaluwarsa dalam 14 hari | Your report expires in 14 days |
| Expiring body | Perpanjang laporan "{reportTitle}" agar tetap aktif. | Renew "{reportTitle}" to keep it active. |
| Expired title | Laporanmu sudah kedaluwarsa | Your report has expired |
| Expired body | Kamu masih bisa memperpanjang dalam 30 hari. | You can still renew within 30 days. |
| CTA | `/me/reports` | |

### `REPORT_REMOVED` / `REPORT_APPROVED` (owner)
| Field | id | en |
|---|---|---|
| Removed title | Laporanmu dihapus moderator | Your report was removed by a moderator |
| Removed body | Alasan: {reason}. Hubungi admin jika kamu merasa ini keliru. | Reason: {reason}. Contact an admin if this seems wrong. |
| Approved title | Laporanmu disetujui | Your report was approved |
| Body | Laporan "{reportTitle}" sudah tayang. | "{reportTitle}" is now visible. |
| CTA | `/reports/{reportId}` | |

### `ADMIN_DISPUTE` (campus moderators)
| Field | id | en |
|---|---|---|
| In-app title | Sengketa baru perlu ditinjau | A new dispute needs review |
| Body | Klaim {claimShortId} disengketakan. Buka antrian untuk meninjau. | Claim {claimShortId} was disputed. Open the queue to review. |
| Email | in-app only | |
| CTA | `/admin/claims` | |

## Email layout rules

1. Plain, accessible HTML (no background images as content); text alternative for every image.
2. Preheader = in-app body; one primary CTA button (also a text link fallback).
3. Footer: why the user received this, notification preferences link (`/me/settings`), campus
   name, and "jangan balas email ini".
4. No attachments; no tracking pixels beyond an aggregate open counter if ever needed
   (`OPEN`, currently: none).
5. Locale follows the recipient's `locale`.

## Unsubscribe

- All service emails except `CLAIM_*` decisions can be muted per type; `email_enabled=false`
  stops all email but keeps in-app.
- Muting is per user, stored in `notification_prefs` (`API-ME-05`).
