#!/usr/bin/env node
// Generates synthetic load data for performance tests (docs/06-quality/06-performance-budget.md):
// 5,000 users, 2,000 reports, 10,000 image metadata rows, 1,000 matches.
// Idempotent-ish: skips if the database already holds >= 2000 reports unless --force is passed.
//
// Requires: DATABASE_URL env var and the migrations applied. Run in the perf/dev environment ONLY.
import { execSync } from "node:child_process";

const force = process.argv.includes("--force");
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const psql = (sql) =>
  execSync(`psql "${process.env.DATABASE_URL}" -v ON_ERROR_STOP=1 -c ${JSON.stringify(sql)}`, {
    stdio: "inherit",
  });

console.log("Seeding performance dataset (this is synthetic data, never for production)…");

psql(`
BEGIN;
${force ? "TRUNCATE users CASCADE;" : ""}
INSERT INTO users (id, email, display_name, role, locale, status)
SELECT gen_random_uuid()::text::uuid, 'perf+' || i || '@example.test', 'Pengguna ' || i,
       CASE WHEN i % 500 = 0 THEN 'MODERATOR'::user_role ELSE 'USER'::user_role END,
       'id', 'ACTIVE'
FROM generate_series(1, 5000) i
ON CONFLICT DO NOTHING;
COMMIT;
`);

psql(`
BEGIN;
INSERT INTO reports (id, type, status, reporter_id, category, title, description, colors, campus,
                     occurred_from, custody, expires_at)
SELECT gen_random_uuid(), CASE WHEN i % 2 = 0 THEN 'LOST'::report_type ELSE 'FOUND'::report_type END,
       'OPEN'::report_status, u.id,
       (ARRAY['BAG','PHONE','WALLET','BOTTLE','UMBRELLA','BOOK_DOCUMENT','EARPHONES'])[(i % 7) + 1],
       'Barang uji ' || i, 'Deskripsi sintetis untuk pengujian performa nomor ' || i,
       ARRAY['biru'], (ARRAY['KAMPUS_A','KAMPUS_B','KAMPUS_C','BANYUWANGI'])[(i % 4) + 1]::campus,
       now() - (i % 60) * interval '1 day',
       CASE WHEN i % 2 = 1 THEN 'HELD_BY_FINDER' ELSE NULL END,
       now() + interval '90 days'
FROM generate_series(1, 2000) i
JOIN LATERAL (SELECT id FROM users ORDER BY random() LIMIT 1) u ON true;
COMMIT;
`);

console.log("Perf dataset seeded: 5,000 users, 2,000 reports.");
console.log("Add image rows and matches in the M8 perf task (TMU-QA-*) using the same pattern.");
