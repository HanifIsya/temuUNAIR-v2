---
id: WF-REVIEW
title: Code review checklist
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["DOR-DOD", "BE-13", "FE-12"]
source_refs: ["Blueprint §7.6"]
---

# Code review checklist

Used by the `reviewer` agent (adversarial, fresh context) and by humans in Orca/GitHub. Findings
are labelled **BLOCKER / MAJOR / MINOR** with `file:line` evidence and a verdict
(APPROVE / CHANGES). The reviewer never fixes code.

## 0. Scope and lane

- [ ] Diff matches the task's stated scope; no drive-by refactors
- [ ] All changed paths are inside the task's lane (`.agent/lanes.json`)
- [ ] No generated files hand-edited (`contracts:check` green)
- [ ] No merged migration edited; migration numbering correct; rollback note present
- [ ] Commit messages are Conventional Commits with `Task:` trailers

## 1. Contract fidelity

- [ ] Behaviour exists in a merged contract; no new behaviour invented in code
- [ ] `expectMatchesContract(apiId, response)` present for every touched endpoint
- [ ] Request schemas strip unknown fields; enums imported from `@temuunair/contracts`
- [ ] Response mapper strips private fields (hint answers, emails, embeddings, raw scores, geo)
- [ ] Error codes come from `BE-04`; no ad-hoc codes; i18n key exists for each

## 2. Correctness and state machines

- [ ] Every state transition touched is covered by a unit test (legal + illegal)
- [ ] Guards enforced in the service inside the transaction, not only in the handler
- [ ] Idempotency implemented for the 3 idempotent POSTs; jobs are safe to run twice
- [ ] Concurrency: `If-Match` on `PATCH /reports/{id}`; `409` on mismatch
- [ ] No N+1 queries; lists paginated and bounded; no unbounded `findMany`

## 3. Security and privacy

- [ ] Auth + RBAC on every new route; campus scoping for moderators
- [ ] Hidden resources return `NOT_FOUND`, not `FORBIDDEN`
- [ ] No secrets in code/logs/tests; pino redaction covers new fields
- [ ] Uploads validated by magic bytes; EXIF stripped; signed URLs short-lived
- [ ] No PII in analytics events or notification payloads
- [ ] Rate limits applied where `BE-12` specifies

## 4. Tests

- [ ] Red evidence recorded before implementation
- [ ] No weakened/deleted assertions; no `skip`/`only`; no sleep-based waits
- [ ] Fixtures synthetic; no real people or UNAIR data
- [ ] Deterministic (stub ML, fixed clocks)
- [ ] Frontend: every `FE-06` state rendered in a test; testids present

## 5. Frontend specifics

- [ ] Only tokens (no raw hex/px/fonts); status never colour-only
- [ ] All strings via i18n keys in both locales
- [ ] Data access only through `lib/api`; no raw `fetch("/api/v1/…")`
- [ ] Query keys/invalidation match `FE-04`; optimistic updates only where allowed
- [ ] a11y: labels, focus management, `aria-live`, keyboard path (`FE-09`)

## 6. Backend specifics

- [ ] Handlers thin; logic in services; SQL only in repositories
- [ ] Audit log written for privileged mutations
- [ ] Jobs enqueue with validated payloads; retry classes correct
- [ ] Migrations forward-only with indexes justified; `CONCURRENTLY` for large tables

## 7. Docs and bookkeeping

- [ ] Task file Progress log current; status correct
- [ ] Traceability row added/updated
- [ ] `CHANGELOG.md` updated for contract changes; `CONTRACT_VERSION` bumped correctly
- [ ] New env vars documented in `BE-11` and `.env.example`

## Verdict format (`docs/08-project/reviews/<ID>.md`)

```markdown
---
id: REV-TMU-BE-010
task: TMU-BE-010
reviewer: reviewer
verdict: APPROVE | CHANGES
date: YYYY-MM-DD
---

## Summary
## BLOCKER
- [ ] `file:line` — issue, why it blocks, suggested direction
## MAJOR
## MINOR
## Checks run
- `pnpm gate` → green
- `pnpm test:contract` → 12 passed
## Notes for the human
```

Rules: findings must be specific and actionable; "looks fine" is not a review; the reviewer runs
the gate themselves and does not trust the agent's summary.
