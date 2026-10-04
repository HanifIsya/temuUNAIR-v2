---
id: TMU-DB-005
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-04
---

# Review — TMU-DB-005

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red tests existed first and failed for the right reason (42P01 table not found) | PASS |
| 2 | All 6 tests pass; full `pnpm gate` green (168/168 unit) | PASS |
| 3 | Migration `0006_ops.sql` creates all 4 tables, dedupe unique, 3 indexes, REVOKE | PASS |
| 4 | Schema mirrors BE-05 exactly (notifications, notification_prefs, flags, audit_logs) | PASS |
| 5 | `db:check: ok` — zero drift between schema.ts and applied migrations | PASS |
| 6 | Seeds: 40 locations, 6 drop points, 12 users, 30 reports; idempotent ON CONFLICT | PASS |
| 7 | Privacy: no PII in seeds (example.test emails, fictional names) | PASS |
| 8 | Rollback note present and accurate | PASS |
| 9 | No out-of-lane edits | PASS |
| 10 | Contracts in sync (v1.1.0) | PASS |

## Notes

- The audit_logs REVOKE test correctly creates a restricted app role to verify UPDATE denial,
  since the DB owner bypasses REVOKE restrictions.
- DEC-022 (drop point naming convention) is not yet filed; seed drop point names use synthetic
  placeholders. This is acceptable per the task spec ("pending DEC-022 confirmation").
- `notifications.dedupe_key` is nullable UNIQUE, matching BE-05 exactly (allows NULL for
  notifications without deduplication).

## Verdict

**APPROVE** — all acceptance criteria met, gate green, no findings.
