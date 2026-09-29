---
id: BE-05
title: Database contract
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-ERD", "BE-01"]
source_refs: ["Blueprint §5A.5", "DEC-002", "DEC-014"]
---

# BE-05 — Database contract

## Migration rules

1. Forward-only SQL migrations named `NNNN_description.sql` (e.g. `0001_init.sql`).
2. **Never edit a merged migration.** Fix forward with a new one.
3. One migration-touching PR open at a time (Blueprint §7.3/§7.5).
4. Every migration ships with a rollback note (how to reverse or why it is irreversible).
5. Seeds are separate from migrations (`packages/db/seeds/`).
6. `CREATE INDEX CONCURRENTLY` for large tables (outside a transaction).
7. `snake_case`; every table has `id uuid pk`, `created_at`, `updated_at` (exceptions noted).
8. Schema changes require a `TMU-CTR-*`/`TMU-DB-*` task and a contract update when they affect
   API shapes.

## DDL (authoritative)

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('USER','MODERATOR','ADMIN');
CREATE TYPE campus AS ENUM ('KAMPUS_A','KAMPUS_B','KAMPUS_C','BANYUWANGI');
CREATE TYPE report_type AS ENUM ('LOST','FOUND');
CREATE TYPE report_status AS ENUM ('PENDING_REVIEW','OPEN','MATCHED','IN_VERIFICATION','RETURNED','EXPIRED','CANCELLED','REMOVED');
CREATE TYPE claim_status AS ENUM ('SUBMITTED','APPROVED','REJECTED','DISPUTED','COMPLETED','CANCELLED','EXPIRED');
CREATE TYPE match_state AS ENUM ('SUGGESTED','DISMISSED','CLAIMED','INVALIDATED');

CREATE TABLE users (
  id uuid PRIMARY KEY, email citext UNIQUE NOT NULL, display_name text NOT NULL,
  unair_ref text,                       -- NIM/NIP if provided; never exposed; nullable
  role user_role NOT NULL DEFAULT 'USER', moderator_campus campus,
  locale text NOT NULL DEFAULT 'id', status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','DELETED')),
  last_login_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
-- + Auth.js adapter tables: accounts, sessions, verification_tokens

CREATE TABLE locations (
  id uuid PRIMARY KEY, campus campus NOT NULL, name text NOT NULL, kind text NOT NULL,   -- BUILDING|ROOM|CANTEEN|LIBRARY|PARKING|PRAYER|SPORT|OUTDOOR|OTHER
  parent_id uuid REFERENCES locations(id), lat double precision, lng double precision, active boolean NOT NULL DEFAULT true
);
CREATE TABLE drop_points (
  id uuid PRIMARY KEY, campus campus NOT NULL, location_id uuid REFERENCES locations(id), name text NOT NULL,
  hours jsonb, contact_note text, active boolean NOT NULL DEFAULT true
);

CREATE TABLE reports (
  id uuid PRIMARY KEY, type report_type NOT NULL, status report_status NOT NULL DEFAULT 'OPEN',
  reporter_id uuid NOT NULL REFERENCES users(id),
  category text NOT NULL, is_sensitive boolean NOT NULL DEFAULT false,
  title text NOT NULL, description text NOT NULL, colors text[] NOT NULL DEFAULT '{}', brand text,
  campus campus NOT NULL, location_id uuid REFERENCES locations(id), location_note text, lat double precision, lng double precision,
  occurred_from timestamptz NOT NULL, occurred_to timestamptz,
  custody text CHECK (custody IN ('HELD_BY_FINDER','AT_DROP_POINT')), drop_point_id uuid REFERENCES drop_points(id),
  expires_at timestamptz NOT NULL, resolved_at timestamptz,
  search_tsv tsvector,                  -- 'simple' config: Postgres has no built-in Indonesian dictionary
  version int NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((type = 'FOUND') = (custody IS NOT NULL))
);
CREATE INDEX reports_browse_idx ON reports (type, status, campus, created_at DESC);
CREATE INDEX reports_reporter_idx ON reports (reporter_id, created_at DESC);
CREATE INDEX reports_tsv_idx ON reports USING gin (search_tsv);
CREATE INDEX reports_expiry_idx ON reports (expires_at) WHERE status IN ('OPEN','MATCHED');

CREATE TABLE report_images (
  id uuid PRIMARY KEY, report_id uuid REFERENCES reports(id) ON DELETE CASCADE, uploader_id uuid NOT NULL REFERENCES users(id),
  storage_key text NOT NULL, thumb_key text, masked_key text, mime text NOT NULL, width int, height int, sha256 text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','READY','REJECTED')), position smallint NOT NULL DEFAULT 0
);
CREATE TABLE verification_hints (         -- FOUND only; answers encrypted at app level (AES-GCM, FIELD_ENCRYPTION_KEY)
  id uuid PRIMARY KEY, report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE, prompt text NOT NULL, answer_enc bytea NOT NULL
);

CREATE TABLE image_features (
  image_id uuid PRIMARY KEY REFERENCES report_images(id) ON DELETE CASCADE,
  embedding vector(512) NOT NULL,        -- CLIP ViT-B/32 image space
  detection jsonb, quality jsonb, category_scores jsonb, model_versions jsonb NOT NULL
);
CREATE TABLE report_features (
  report_id uuid PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
  image_embedding vector(512),           -- mean of L2-normalised image embeddings (nullable)
  clip_text_embedding vector(512),       -- multilingual text encoder in CLIP space
  sentence_embedding vector(384),        -- text↔text similarity
  attributes jsonb NOT NULL DEFAULT '{}', model_versions jsonb NOT NULL, processed_at timestamptz NOT NULL
);
CREATE INDEX report_features_img_hnsw ON report_features USING hnsw (image_embedding vector_cosine_ops);
CREATE INDEX report_features_txt_hnsw ON report_features USING hnsw (clip_text_embedding vector_cosine_ops);
CREATE INDEX report_features_sent_hnsw ON report_features USING hnsw (sentence_embedding vector_cosine_ops);

CREATE TABLE matches (
  id uuid PRIMARY KEY, lost_report_id uuid NOT NULL REFERENCES reports(id), found_report_id uuid NOT NULL REFERENCES reports(id),
  score numeric(4,3) NOT NULL, band text NOT NULL, reasons jsonb NOT NULL, components jsonb NOT NULL,  -- per-signal scores for debugging/eval
  state match_state NOT NULL DEFAULT 'SUGGESTED', algo_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lost_report_id, found_report_id)
);
CREATE TABLE claims (
  id uuid PRIMARY KEY, found_report_id uuid NOT NULL REFERENCES reports(id), lost_report_id uuid REFERENCES reports(id),
  claimant_id uuid NOT NULL REFERENCES users(id), status claim_status NOT NULL DEFAULT 'SUBMITTED', note text,
  handover_place text, handover_at timestamptz, finder_confirmed_at timestamptz, claimant_confirmed_at timestamptz,
  decided_by uuid REFERENCES users(id), decision_reason text, expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX claims_one_active_per_claimant ON claims (found_report_id, claimant_id) WHERE status IN ('SUBMITTED','APPROVED','DISPUTED');
CREATE UNIQUE INDEX claims_one_approved_per_report ON claims (found_report_id) WHERE status = 'APPROVED';
CREATE TABLE claim_answers (claim_id uuid REFERENCES claims(id) ON DELETE CASCADE, hint_id uuid REFERENCES verification_hints(id), answer text NOT NULL, PRIMARY KEY (claim_id, hint_id));

CREATE TABLE messages (id uuid PRIMARY KEY, claim_id uuid NOT NULL REFERENCES claims(id), sender_id uuid NOT NULL REFERENCES users(id), body text NOT NULL CHECK (char_length(body) <= 1000), created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz);
CREATE TABLE notifications (id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), type text NOT NULL, payload jsonb NOT NULL, dedupe_key text UNIQUE, read_at timestamptz, emailed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE notification_prefs (user_id uuid PRIMARY KEY REFERENCES users(id), email_enabled boolean NOT NULL DEFAULT true, muted_types text[] NOT NULL DEFAULT '{}');
CREATE TABLE flags (id uuid PRIMARY KEY, report_id uuid NOT NULL REFERENCES reports(id), reporter_id uuid NOT NULL REFERENCES users(id), reason text NOT NULL, note text, status text NOT NULL DEFAULT 'OPEN', resolved_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE audit_logs (id uuid PRIMARY KEY, actor_id uuid, action text NOT NULL, entity_type text NOT NULL, entity_id uuid, before jsonb, after jsonb, ip_hash text, request_id text, created_at timestamptz NOT NULL DEFAULT now());
-- audit_logs is append-only: REVOKE UPDATE, DELETE from the app role.
-- pg-boss creates its own `pgboss` schema.
```

## Additions required by the docs (to be included in `0001_init.sql`)

```sql
-- report processing marker (BE-07 dead-letter behaviour)
ALTER TABLE reports ADD COLUMN needs_reprocess boolean NOT NULL DEFAULT false;

-- retention helpers
CREATE INDEX messages_claim_created_idx ON messages (claim_id, created_at DESC);
CREATE INDEX notifications_user_created_idx ON notifications (user_id, created_at DESC);
CREATE INDEX audit_logs_created_idx ON audit_logs (created_at DESC);
CREATE INDEX flags_report_idx ON flags (report_id) WHERE status = 'OPEN';
CREATE INDEX claims_status_idx ON claims (status, created_at);

-- full-text maintenance (trigger keeps search_tsv fresh)
CREATE FUNCTION reports_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv := to_tsvector('simple',
    coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,'') || ' ' ||
    coalesce(NEW.brand,'') || ' ' || array_to_string(NEW.colors, ' '));
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER reports_tsv_trg BEFORE INSERT OR UPDATE OF title, description, brand, colors
  ON reports FOR EACH ROW EXECUTE FUNCTION reports_tsv_update();
```

## Index rationale

| Index | Serves |
|---|---|
| `reports_browse_idx` | browse default query (type, status, campus, recency) |
| `reports_reporter_idx` | `/reports/mine` |
| `reports_tsv_idx` (GIN) | text search |
| `reports_expiry_idx` (partial) | expiry sweep |
| HNSW ×3 | candidate retrieval (`MATCH-SPEC` §2) |
| partial unique claims ×2 | state machine invariants C2/C7 |
| `messages_claim_created_idx` | chat pagination |
| `notifications_user_created_idx` | feed pagination |

## Constraints that encode rules

- `CHECK ((type = 'FOUND') = (custody IS NOT NULL))` — FOUND always declares custody.
- `claims_one_approved_per_report` — at most one approved claim (R4/C2).
- `claims_one_active_per_claimant` — one active claim per claimant per report.
- `notifications.dedupe_key UNIQUE` — no duplicate notifications.
- `matches UNIQUE (lost_report_id, found_report_id)` — one row per pair (upsert on rematch).
- `audit_logs` privileges — append-only.

## Seeds

`packages/db/seeds/` provides synthetic: 4 campuses, ~40 locations, 4–6 drop points, 12 users
(1 admin, 4 moderators, 7 users), 30 reports (mixed types/categories incl. 3 sensitive), sample
images in `tests/fixtures/`. All names are fictional (`Pengguna Contoh`), emails on
`example.test`.
