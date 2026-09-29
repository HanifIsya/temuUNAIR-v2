---
id: SEEDS
title: Seed and fixture data
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["BE-05", "E2E", "TEST-STRATEGY"]
source_refs: ["Blueprint §4.7"]
---

# Seed and fixture data

Two separate datasets: **seeds** for demos/dev (`pnpm seed` / `/seed-demo`) and **fixtures** for
tests. Both are 100% synthetic.

## Seed dataset (`packages/db/seeds/`)

| Entity | Contents |
|---|---|
| Campuses | `KAMPUS_A`, `KAMPUS_B`, `KAMPUS_C`, `BANYUWANGI` |
| Locations | ~10 per campus (library, canteen, parking, faculty buildings, prayer room, sport hall) with `kind` |
| Drop points | 4–6, one per campus, hours + contact note marked "contoh" until real data lands (O-1) |
| Users | 12: `admin@example.test`, 4 moderators (one per campus), 7 users — display names like "Budi S." |
| Reports | 30: 15 LOST, 15 FOUND; 3 sensitive (`ID_CARD`, `BANK_CARD`, `WALLET`); mixed categories and campuses; several with occurred windows |
| Images | Synthetic placeholders from `tests/fixtures/images/` (one card-like image for sensitive) |
| Matches | Precomputed for 4 pairs (2 STRONG, 2 POSSIBLE) so the demo shows suggestions without waiting |
| Claims | 2 in-flight: one SUBMITTED, one APPROVED with a handover plan |
| Notifications | A few unread rows for the demo user |

### Rules

1. All emails use `example.test`; names are obviously fictional (`Pengguna Contoh`, `Budi S.`).
2. No real UNAIR data, no real drop points until stakeholders confirm (marked "contoh").
3. Seeds are idempotent (`ON CONFLICT DO NOTHING`) and safe to re-run.
4. Seeds never run in production (`NODE_ENV=production` guard).
5. Seed scripts live in `packages/db/seeds/` and are separate from migrations.

### Demo accounts (dev only)

| Account | Role | Purpose |
|---|---|---|
| `admin@example.test` | ADMIN | full console |
| `mod.a@example.test` | MODERATOR (Kampus A) | campus-scoped moderation |
| `loser@example.test` | USER | demo of the lost-item journey |
| `finder@example.test` | USER | demo of the found-item journey |

Passwords are irrelevant (magic link in dev); the dev provider accepts these addresses because
the test domain is in `AUTH_ALLOWED_DOMAINS` for the dev env only.

## Test fixtures (`tests/fixtures/`)

| Path | Contents |
|---|---|
| `images/normal/*.jpg` | 6 CC0/generated item photos (bag, bottle, umbrella, book, charger, helmet) |
| `images/sensitive/card.jpg` | synthetic card-like image (fake number `0000 …`) |
| `images/invalid/*` | wrong-magic-byte file, oversized file, truncated JPEG |
| `ml/` | ML eval dataset (`04-ml-eval-dataset-spec.md`) |
| `api/*.json` | request/response fixtures validated by contract tests |
| `db/*.sql` | minimal fixtures for integration tests |

### Rules

1. Fixtures are committed only if licence-clean; provenance recorded in a `LICENSES.md`.
2. EXIF is stripped from fixture images (except the one file that deliberately tests stripping).
3. No fixture contains real personal data.
4. MSW handlers are generated; fixtures are the only hand-written data.

## Demo script data flow

`/seed-demo` (backend-dev skill) loads the seed set, then the demo follows
`docs/09-course/demo-script.md`: login → report → match → claim → chat → handover → admin queue.

## Maintenance

- Update seeds when the schema changes (same PR as the migration, or a follow-up `db` task).
- Update fixtures when contract shapes change (contract PR regenerates MSW; fixtures updated in
  the same PR if needed).
- Real drop points and locations replace the "contoh" set once confirmed (O-1) — a `docs`+`db`
  task pair.
