---
id: FE-12
title: Frontend test contract
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["FE-03", "FE-06", "TEST-STRATEGY"]
source_refs: ["Blueprint §5B.10"]
---

# FE-12 — Frontend test contract

## `data-testid` scheme

kebab-case `<component>-<element>[-<key>]`, placed on the interactive node:

| Pattern | Examples |
|---|---|
| Buttons | `wizard-next`, `report-claim-button`, `claim-approve-button`, `chat-send-button` |
| Inputs | `browse-search-input`, `challenge-answer-<hintId>`, `chat-composer-input` |
| Cards/rows | `report-card-<id>`, `match-card-<id>`, `claim-card-<id>`, `admin-report-row-<id>` |
| Containers | `matches-list`, `notifications-list`, `admin-reports-table` |
| States | `error-request-id`, `empty-state-<screen>`, `offline-banner` |
| Uploads | `photo-uploader-input`, `photo-uploader-item-<n>`, `photo-uploader-error-<n>` |

Rules: every interactive element listed in a component contract has a testid; ids are stable
across refactors; testids never used for styling.

## Component tests (Vitest + Testing Library + jest-axe)

Each component must:

1. Render **every state** from `FE-06` (loading, empty, error, masked, etc.).
2. Be fully keyboard operable (tab order, Enter/Space, ESC where applicable).
3. Produce **zero axe violations**.
4. Use MSW handlers generated from the contract registry — never hand-written response shapes.
5. Assert text comes from i18n keys (no literal matching that would break in `en`).

## Hook tests

- Query key and invalidation behaviour per mutation (cache assertions via a test query client).
- Polling intervals and pause-when-hidden behaviour.
- Optimistic update + rollback for mark-read, dismiss, chat send.

## Form tests

- Per wizard step: validation blocks, `canProceed`, error mapping from mocked `422`
  `details.fields[]`, draft save/restore, leave-guard.
- Double-submit prevention and `Idempotency-Key` reuse on retry.

## MSW

- `packages/contracts/generated/msw-handlers.ts` generated; tests import handlers and override
  per test only via `server.use(...)` with contract-typed factories.
- Contract validation: a CI job parses every fixture with the registry schema (`BE-13` §1).

## E2E (Playwright, `ML_MODE=stub`)

| ID | Scenario |
|---|---|
| E2E-01 | Login with allowed domain; disallowed domain shows error page |
| E2E-02 | Create LOST report with photo → appears in "My reports" |
| E2E-03 | Create FOUND report (custody + hints) |
| E2E-04 | Match suggestion appears for the LOST owner after a similar FOUND report is processed |
| E2E-05 | Browse + text search + image search + filters |
| E2E-06 | Claim with hidden-detail answers → finder approves |
| E2E-07 | Claim rejected → claimant sees reason |
| E2E-08 | Chat exchange; notification bell updates |
| E2E-09 | Handover with two-sided confirmation → both reports `RETURNED` |
| E2E-10 | Sensitive item: masked photo, generalized description, ≥2 hints enforced |
| E2E-11 | Flag report ×2 → moderation queue → remove |
| E2E-12 | Admin resolves disputed claim |
| E2E-13 | Report expiry and renew |
| E2E-14 | Mobile viewport smoke of E2E-02/03/06 |
| E2E-15 | Locale switch id↔en persists |

E2E rules: deterministic (stubbed ML, fixed clock where possible, seeded ids), no sleeps, each
test creates its own data via API calls where practical, and asserts on testids — never on
brittle CSS.

## Coverage and gates

| Gate | Requirement |
|---|---|
| `pnpm gate` | component/hook/form tests pass; lint/typecheck/i18n clean |
| `pnpm gate:full` | E2E suite passes on a built app with compose services |
| Review | new components without state tests or testids are sent back |

Flaky policy: quarantine with a blocker file; never retry-until-green
(`docs/05-workflow/02-agent-loop.md`).
