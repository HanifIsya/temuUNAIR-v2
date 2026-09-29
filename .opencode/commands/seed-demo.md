---
description: Load synthetic demo data for local development and demos
agent: backend-dev
---
1. Run `pnpm seed` (seeds are defined in `packages/db/seeds/` per
   `docs/06-quality/05-seed-and-fixture-data.md`).
2. Confirm: 4 campuses, locations, 4–6 drop points (marked "contoh"), 12 users, 30 reports
   (3 sensitive), precomputed matches, 2 in-flight claims, some unread notifications.
3. Refuse to run if `NODE_ENV=production`.
4. Report counts and the demo account list (`loser@example.test`, `finder@example.test`,
   `mod.a@example.test`, `admin@example.test`).
