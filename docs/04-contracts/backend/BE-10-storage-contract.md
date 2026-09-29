---
id: BE-10
title: Storage contract
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-MEDIA", "BE-04", "DEC-010"]
source_refs: ["Blueprint §5A.3 API-UPL-*, ADR-0008"]
---

# BE-10 — Storage contract

## Upload handshake

| Step | API | Detail |
|---|---|---|
| 1 | `POST /uploads` (`API-UPL-01`) | `UploadInit{mime,sizeBytes,sha256?}` → `{uploadId,uploadUrl,expiresAt}`; `Idempotency-Key` required |
| 2 | `PUT uploadUrl` (direct to storage) | presigned, 5-minute TTL, exact `Content-Type` required, `Content-Length` bounded |
| 3 | `POST /uploads/{id}/complete` (`API-UPL-02`) | server HEADs the object, verifies size/content-type, strips EXIF, makes thumb + masked variants, sets status |
| 4 | `GET /uploads/{id}` (`API-UPL-03`) | poll `UploadState` while processing |

## Limits

| Limit | Value | Error |
|---|---|---|
| Max size | 8 MB per image | `UPLOAD_TOO_LARGE` (413) |
| Max images per report | 5 | `UPLOAD_LIMIT_REACHED` (409) |
| Allowed MIME | `image/jpeg`, `image/png`, `image/webp`, `image/heic` (HEIC→JPEG server-side) | `UPLOAD_INVALID_TYPE` (415) |
| Min dimension | 320 px shortest side | `REJECTED` state with reason |
| Uploads per hour | 30 (`BE-12`) | `RATE_LIMITED` (429) |
| Unattached upload TTL | 24 h, then `media.cleanup` deletes | — |
| Presigned PUT TTL | 5 min | — |
| Presigned GET TTL (worker/ML) | 5 min | — |

## Key naming

```
uploads/{uploadId}                       # pending, never public
reports/{reportId}/{imageId}.jpg         # original (EXIF-stripped, normalized)
reports/{reportId}/{imageId}_thumb.jpg   # 480 px longest side
reports/{reportId}/{imageId}_masked.jpg  # sensitive categories only
```

Keys are unguessable (UUIDs); the bucket is private; no directory listing; no user-supplied
filenames.

## `UploadState`

```jsonc
{
  "id": "018f2d…",
  "status": "PENDING",          // PENDING | READY | REJECTED
  "mime": "image/jpeg",
  "sizeBytes": 2841332,
  "thumbUrl": null,             // signed URL when READY
  "url": null,                  // signed URL for the owner when READY
  "masked": false,
  "rejectionReason": null       // i18n key when REJECTED
}
```

## Serving rules

| Audience | Gets |
|---|---|
| Public/other users | `thumbUrl` always; full `url` only for non-sensitive READY images |
| Sensitive reports | masked variant only, `url: null`, non-zoomable in UI |
| Owner | original + thumb (signed, short TTL) |
| Moderator | original + masked (access audited) |
| ML worker | short-lived signed GET to the original |

## Processing contract

1. EXIF **fully** stripped, including GPS; orientation applied to pixels (ADR-0008).
2. HEIC converted to JPEG; output sRGB JPEG quality 82.
3. Thumbnail 480 px longest side, quality 75.
4. Masking applied for `isSensitive` categories (blur/overlay over the likely card region, or
   the whole image if uncertain).
5. Processing failure → `REJECTED` with an i18n reason; a FOUND report cannot be submitted until
   at least one image is `READY`.

## Security requirements

- Presigned PUT is scoped to a fresh UUID key, content type and max size; cannot overwrite.
- The server re-validates on `complete` (magic bytes, not just headers).
- ML image fetch allowlists the storage host and rejects redirects (SSRF, `THREAT-MODEL` TB-3).
- No original is served to a non-owner for sensitive items; no EXIF ever leaves the pipeline.

## Testing

- Contract tests: `UploadInit`, `UploadState` parse; error codes for each limit.
- Integration: presign → upload fixture → complete → assert keys, sizes, EXIF absence, thumb
  dimensions, masked variant for a sensitive fixture.
- Negative: oversized, wrong MIME, mismatched magic bytes, foreign upload id (`NOT_FOUND`),
  expired URL (storage 403).
