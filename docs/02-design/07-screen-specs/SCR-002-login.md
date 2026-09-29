---
id: SCR-002
title: Login and auth error
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["IA", "FE-09"]
source_refs: ["FR-AUTH-001..003", "DEC-001"]
---

# SCR-002 — Login (`/login`) and auth error (`/auth/error`)

## Purpose
Start Google OAuth and explain domain restriction. Never show a raw provider error.

## Entry points / exits
Entry: landing CTA, guarded redirect `/login?next=…`, notification deep-links when signed out.
Exits: OAuth consent → `/home` (or `next`); on failure → `/auth/error`.

## Layout regions
1. Card centered (max 400 px): logo, heading, short explanation of "akun UNAIR".
2. Primary button "Lanjutkan dengan Google".
3. Dev-only magic-link form (`NODE_ENV=development` only).
4. Small print: link to `/privacy`.

## Data
Auth.js only; no app API. `next` query param preserved through the flow (allowlist-validated
to internal paths only).

## Components
| CMP | Variant | Notes |
|---|---|---|
| 001 | minimal header | no nav |
| 027 | `ErrorState` | used on `/auth/error` |

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| button spinner while redirecting | — | `/auth/error` explains `AUTH_DOMAIN_NOT_ALLOWED` with a "coba akun lain" link | same as error | inline "koneksi bermasalah" |

## Copy keys
`login.title` · `login.google` · `login.note.domain` ("Gunakan akun UNAIR kamu") ·
`auth.error.domain` ("Akun ini bukan akun UNAIR. Masuk dengan email kampus.") ·
`auth.error.generic` ("Gagal masuk. Coba lagi.").

## Analytics
`login_started`, `login_failed{reason:domain|oauth|network}` (no email in props).

## Accessibility
- `<h1>` = "Masuk". Focus lands on the card heading on load.
- Error text linked to the button with `aria-describedby`.

## Test hooks
`login-card`, `login-google-button`, `auth-error-message`.

## Open questions
- `OPEN`: whether UNAIR uses Google Workspace exclusively (DEC-001).
