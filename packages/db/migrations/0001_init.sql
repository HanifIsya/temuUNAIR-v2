-- 0001_init: baseline extensions only (BE-05). Domain tables arrive with TMU-DB-001..005.
-- rollback: DROP EXTENSION IF EXISTS citext; DROP EXTENSION IF EXISTS vector;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS citext;
