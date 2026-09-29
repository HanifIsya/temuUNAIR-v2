---
id: ADR-0008
title: Presigned uploads, EXIF stripping and masking of sensitive photos
status: accepted
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-MEDIA", "THREAT-MODEL"]
source_refs: ["DEC-010", "DEC-014", "Blueprint §5A.3 API-UPL-*"]
---

# ADR-0008 — Presigned uploads, EXIF stripping and masking of sensitive photos

## Context

Users upload phone photos that often contain GPS EXIF and, for sensitive categories (KTM, ATM
cards), identity data. The API must accept large files without proxying them through the app,
and public views must never expose identity data.

## Options

1. **Proxy uploads through the web app** — simple, but burns app bandwidth/memory and couples
   upload availability to the web process.
2. **Presigned direct-to-storage uploads with server-side post-processing** — app only issues
   scoped URLs and validates afterwards; storage handles bytes.
3. **Client-side stripping/masking** — untrusted; cannot be enforced; rejected as the only layer.

## Decision

Option 2, with server-side processing as the authority:

- Two-step handshake (`POST /uploads` → presigned PUT → `POST /uploads/{id}/complete`).
- Server validates magic bytes/size, strips **all** EXIF (GPS included), converts HEIC→JPEG,
  generates thumbnails, and produces a masked variant for sensitive categories.
- Public views serve `thumbUrl` and, for non-sensitive items only, the full `url`; sensitive
  items serve only the masked variant (`url: null`, non-zoomable).

## Consequences

- Uploads are fast and cheap; the bucket stays private with short-lived signed GETs.
- EXIF stripping happens exactly once, in one place; a failure is a rejection, never a
  pass-through.
- Masking is heuristic (aspect ratio + text density) — it can over-mask (acceptable) or
  under-mask (mitigated by moderation and by `isSensitive` display rules that hide the
  unmasked variant entirely for public users).
- `report_images` keeps `storage_key`, `thumb_key`, `masked_key` so a masking-rules change can
  regenerate variants without re-upload.
- ML reads originals via short-lived presigned URLs (ADR-0009 pipeline), never public URLs.
