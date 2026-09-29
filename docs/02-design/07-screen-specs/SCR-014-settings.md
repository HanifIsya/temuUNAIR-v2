---
id: SCR-014
title: Account settings
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["IA", "FE-05", "CMP"]
source_refs: ["FE-01", "API-ME-01..05", "FR-AUTH-004", "FR-AUTH-005", "FR-NTF-006"]
---

# SCR-014 — Settings (`/me/settings`)

## Purpose
Profile, language, notification preferences and account deletion — the privacy control centre.

## Entry points / exits
Entry: avatar menu, bottom nav "Akun". Exit: sign out; deletion flow returns to `/`.

## Layout regions
1. Profile: display name (editable), email (read-only), role badge (admin/moderator only).
2. Bahasa: `LocaleSwitcher` (id/en) with instant preview.
3. Notifikasi: email toggle + per-type mute list (from `NotificationType` families).
4. Privasi & data: link to `/privacy`; "Unduh data saya" (`OPEN`, phase 2);
   "Hapus akun" → `ConfirmDialog` with typed confirmation.
5. Session: "Keluar".

## Data
| Field | API | Notes |
|---|---|---|
| Me | API-ME-01 | name, locale, role, email |
| Update | API-ME-02 | display name, locale |
| Preferences | API-ME-04/05 | `email_enabled`, `muted_types` |
| Delete | API-ME-03 | 202 + explanation of 7-day cool-off |

## Components
`LocaleSwitcher` (003) · `ConfirmDialog` (029) · `ToastProvider` (036).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| form skeleton | — | field errors + toast with requestId | — | save disabled + banner |

## Copy keys
`settings.profile.title` · `settings.profile.name` · `settings.profile.email.readonly` ·
`settings.language.title` · `settings.notifications.title` ·
`settings.notifications.email` ("Kirim email untuk notifikasi penting") ·
`settings.notifications.mute` · `settings.privacy.title` · `settings.delete.title` ("Hapus akun") ·
`settings.delete.confirm` ("Ketik HAPUS untuk konfirmasi") ·
`settings.delete.explain` ("Akun dianonimkan setelah 7 hari. Laporan dan foto dihapus.").

## Analytics
`settings_viewed`, `locale_changed{locale}`, `notification_prefs_changed`, `account_deletion_requested`.

## Accessibility
- Destructive action is not the default focus; confirmation requires typing and is announced.
- Locale switch announces the change to screen readers.

## Test hooks
`settings-name-input`, `settings-locale-switcher`, `settings-email-toggle`,
`settings-mute-<type>`, `settings-delete-button`, `settings-delete-confirm-input`.

## Open questions
- `OPEN`: whether "Unduh data saya" ships in MVP (UU PDP access right) — legal input needed.
