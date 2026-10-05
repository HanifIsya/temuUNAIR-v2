---
id: TMU-BE-005
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-04
---

# Review — TMU-BE-005

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red tests existed first and failed for the right reason (`Cannot find module './meta'`, `Tests no tests`) | PASS |
| 2 | All new/updated tests pass; full `pnpm gate` green after fixing two typecheck findings | PASS |
| 3 | Contract tests for every touched API: `expectMatchesContract` on API-META-01..04 (live scratch-DB suite) | PASS |
| 4 | Auth/RBAC: user-level auth asserted — 401 `AUTH_REQUIRED` on all four endpoints when unauthenticated; GETs skip CSRF; no role escalation surface | PASS |
| 5 | Privacy: catalogs contain only synthetic seed data and static meta (no PII, no emails, no geo of sensitive items); seed fixtures are the PII-free TMU-DB-005 set | PASS |
| 6 | i18n: no new UI strings; `labelKey` values (`category.*`) are contract-provided keys consumed by existing `id`/`en` messages | PASS (n/a) |
| 7 | A11y: no UI components touched | PASS (n/a) |
| 8 | Docs: task file status DONE + Progress log with red/green/gate evidence + contract observations; this review | PASS |
| 9 | Generated files in sync (`contracts:check OK 1.1.0`); contract untouched | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security: validated `?campus=` filter (422, never 500) kills injection/enum-probing; static SQL only via Drizzle with column filters; no raw user input concatenated | PASS |
| 12 | Work in lane (`be` lane globs only: `apps/web/src/server/**`, `apps/web/src/app/api/**`, `**/*.test.ts` + `_common` docs); lane check green in gate | PASS |

## Notes

- **Enum parity is tested, not assumed**: because prod code cannot statically import
  `@temuunair/contracts/src/*` (TS5097, same constraint as BE-003), `CATEGORY_META` and
  `CAMPUS_META` mirror the contract enums by hand — the test loads the merged enums via the
  new `loadContractEnums()` escape hatch and asserts exact `toEqual` parity (values, order,
  sensitive set). Drift breaks CI.
- **Sensitive set** comes from FR-REP-009 (`ID_CARD`, `BANK_CARD`, `WALLET` sensitive-lite)
  and is asserted as an exact list; every category carries ≥ 2 Indonesian hint prompts per
  DEC-014 and the BE-03 examples (PHONE/ID_CARD wording reused verbatim).
- **Seeded catalogs**: the suite migrates a scratch DB and applies the real
  `generateLocationsSql()`/`generateDropPointsSql()` from TMU-DB-005, so assertions run
  against production fixture content (40 locations, 6 "contoh" drop points, DEC-022), not
  hand-inserted stand-ins. jsonb `hours` objects are formatted into the contract's string
  (`weekday: 07:00-17:00, …`); `active` rows only.
- **`locationCount`** (optional in `CampusMeta`) is served from an `active`-only grouped
  count — additive, contract-legal, saves the FE a second query.
- **Two typecheck findings fixed pre-merge** (documented in the task file): misplaced
  interface imports, and a static import of the never-typechecked db-lane seed file — the
  latter resolved with the established non-literal dynamic-import pattern; no db-lane file
  was modified.
- **Contract observation**: registry `API-META-04.errors` omits `VALIDATION_FAILED` for the
  documented `?campus=` filter — behaviour matches META-03; filed for `TMU-CTR-*`.

## Verdict

**APPROVE** — all acceptance criteria met, gate green, no BLOCKER/MAJOR findings.
