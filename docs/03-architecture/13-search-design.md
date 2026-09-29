---
id: ARCH-SEARCH
title: Search design
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-ERD", "MATCH-SPEC", "FR-SRC"]
source_refs: ["Blueprint §5A.3 API-SRC-01, §5A.9", "DEC-003"]
---

# Search design

Three discovery paths, in order of cost: **browse** (SQL filters), **text search** (Postgres
FTS), **image search** (vector). AI suggestions (`MATCH`) are a separate surface, not a search.

## Browse (`API-REP-02`)

- Default: reports of the opposite type of the caller's active intent; `?type=` overrides.
- Never returns: the caller's own reports; `PENDING_REVIEW`, `REMOVED`, `CANCELLED`, `EXPIRED`,
  `RETURNED`.
- Filters: `campus`, `category` (multi), `dateFrom`/`dateTo` (occurred), `custody`, `q`.
- Sort allowlist: `createdAt`, `occurredFrom` (prefix `-` = desc). Default `-createdAt`.
- Cursor pagination (`limit` ≤ 50) using `(created_at, id)` keyset; index
  `reports_browse_idx (type, status, campus, created_at DESC)`.
- Sensitive masking applied in the mapper: title/description generalized, images masked,
  `url: null`.

## Text search (`API-SRC-01`)

- Postgres FTS with the **`simple`** configuration (no built-in Indonesian dictionary; DEC note
  in BE-05). Store `search_tsv` generated from `title || description || brand || colors`.
- Query building: split input on whitespace, prefix-match each token (`token:*`), AND across
  tokens, OR across fields via the tsvector. Empty/1-char tokens ignored.
- Ranking: `ts_rank_cd` desc, then recency. Hits include band/reasons if a stored match exists.
- Fallback when FTS yields nothing: `ILIKE` on title/brand (bounded, indexed trigram optional)
  so typos still surface something.
- Search results respect the same visibility and masking rules as browse.

## Image search (`API-SRC-01` with `imageUploadId`)

1. Validate the upload belongs to the caller and is `READY`.
2. Compute/retrieve its embedding (cached in `image_features`; otherwise call ML
   `analyze-image` once, `ML_MODE=stub` in tests).
3. ANN over `report_features.image_embedding` (HNSW, cosine) → top 50.
4. Union with browse filters, re-rank by cosine, return `Paged<SearchHit>` with `band` when the
   pair already has a stored match.
- Latency budget: ≤ 800 ms p95 including embedding when cached.

## Query parameters (shared)

| Param | Type | Notes |
|---|---|---|
| `q` | string ≤ 120 | text search |
| `imageUploadId` | uuid | image search; at least one of `q`/`imageUploadId` required |
| `campus` | enum multi | repeated params |
| `category` | enum multi | repeated params |
| `dateFrom`, `dateTo` | ISO date | occurred window overlap |
| `custody` | enum | FOUND only |
| `type` | `LOST`/`FOUND` | default opposite of active intent |
| `sort` | allowlist | `-createdAt` default |
| `limit`, `cursor` | int ≤ 50, opaque | pagination |

## Ranking and explanations

- Search is deterministic (no personalization in MVP).
- When a hit corresponds to a stored match, `band` and `reasons[]` are attached (no raw score).
- Users can dismiss a hit that is also a match from the match surface only.

## Performance

| Operation | Budget p95 |
|---|---|
| Browse with filters | ≤ 250 ms |
| FTS query | ≤ 300 ms |
| Image search (cached embedding) | ≤ 800 ms |
| ANN query (50) | ≤ 80 ms |

Indexes: `reports_browse_idx`, `reports_tsv_idx` (GIN), HNSW on the three vector columns.
Vacuum/analyze tuned by default Postgres autovacuum.

## Testing

- Unit: query builder (tokens, escaping, param coercion).
- Integration: seeded corpus asserting visibility rules, masking, pagination stability.
- Contract: `SearchHit` schema; `422` when neither `q` nor `imageUploadId`.
- E2E-05: browse + text + image search + filters.
