<!-- PR title = the Conventional Commit squash message (Blueprint §7.2). -->

## Task

- [ ] Task: `TMU-XXX-###` <!-- link the task file -->
- [ ] Lane: <!-- docs | arch | contracts | db | be | fe | ml | qa | ops | sec | meta -->
- [ ] Milestone: <!-- M0..M9 -->

## What and why

<!-- Why this change exists. Not a restatement of the diff. -->

## Definition of Done evidence

- [ ] Red test evidence recorded in the task Progress log
- [ ] `pnpm gate` green <!-- paste the tail of the output -->
- [ ] Contract tests pass for every touched `API-*` (`expectMatchesContract`)
- [ ] New/changed i18n keys added for both `id` and `en` (including `error.<code>`)
- [ ] Privacy: no hint answers, emails, embeddings or sensitive image URLs logged/returned
- [ ] Docs updated (task file status, traceability row, CHANGELOG for contract changes)

## Labels

- [ ] `contract` <!-- changes packages/contracts or docs/04-contracts -->
- [ ] `breaking` <!-- requires major bump + ADR -->
- [ ] `migration` <!-- packages/db/migrations -->
- [ ] `docs-only`
- [ ] `needs-human`

## Screenshots / recordings (UI changes)

<!-- Before/after, mobile + desktop. -->

## Reviewer notes

<!-- Anything a reviewer must know: trade-offs, follow-ups, known limits. -->
