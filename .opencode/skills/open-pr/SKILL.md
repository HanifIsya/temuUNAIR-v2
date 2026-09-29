---
name: open-pr
description: Create or refresh a pull request from the repository template with the correct title, labels and evidence.
---

1. Ensure the branch is pushed (`git push -u origin HEAD`) and the gate is green.
2. Title = the Conventional Commit squash message (same rules as `commit-and-push`).
3. Body = `.github/PULL_REQUEST_TEMPLATE.md`, filled:
   - task id + lane + milestone;
   - what/why;
   - DoD evidence: red-test evidence, gate tail, contract test names, i18n check, privacy note;
   - labels: `contract` / `breaking` / `migration` / `docs-only` / `needs-human`;
   - screenshots for UI changes;
   - reviewer notes.
4. Link the review file `docs/08-project/reviews/<TASK-ID>.md` once it exists.
5. Create with `gh pr create --draft` on the first push; `gh pr ready` when the DoD is met.
6. Report the PR URL and CI status.

Rules: never push to `main`; one task per PR; contract PRs merge before dependents; only one
migration PR open at a time.
