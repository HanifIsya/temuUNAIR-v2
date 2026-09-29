---
id: WF-RELEASE
title: Release process
status: draft
owner: GS
updated: 2026-09-29
depends_on: ["WF-CICD", "DEPLOYMENT"]
source_refs: ["Blueprint §7.11"]
---

# Release process

`0.x` semver while pre-launch. Milestone tags `m<N>-<name>`; releases `v<semver>` from `main`
with a generated changelog. Deploys are human-triggered.

## Versioning

| Artifact | Scheme | Example |
|---|---|---|
| App releases | semver `v0.x.y` | `v0.1.0` |
| Contract sets | semver `contract-v<semver>` | `contract-v1.0.0` |
| Milestones | `m<N>-<name>` | `m5-matching` |

Breaking changes bump major (pre-1.0: minor), add an ADR, and update `CHANGELOG.md`.

## Release checklist

1. All milestone tasks `DONE`; `docs/08-project/status.md` shows 100%.
2. `pnpm gate:full` green on `main`; E2E suite green.
3. Migrations reviewed; pre-migration backup plan written.
4. `docs/08-project/changelog.md` updated (Keep a Changelog) with the release section.
5. Demo checklist passed; UAT feedback triaged (M9).
6. Tag: `git tag -a v0.x.y -m "…"` and `git push origin v0.x.y` (human).
7. Deploy per the runbook: build images → backup → migrate → rolling restart → smoke tests.
8. Announce in the course report and to stakeholders.

## Milestone tags

`m<N>-<name>` is created by the human after the milestone gate (gate:full + E2E + demo +
roadmap update + risk review). Contract sets are tagged `contract-v<semver>` at the moment the
contract PR merges.

## Changelog format

```markdown
## [0.1.0] — 2026-11-15
### Added
- …
### Changed
- …
### Fixed
- …
### Security
- …
```

Every entry links the PR. Contract changes also appear in `docs/04-contracts/CHANGELOG.md`.

## Rollback

1. Redeploy the previous image tag.
2. Migrations are forward-only: apply the documented rollback note if the migration is
   reversible; otherwise restore from the pre-migration backup (data-loss window documented).
3. Post-mortem entry in `docs/07-ops/05-incident-response.md` if users were affected.

## Hotfix path

1. `fix/…` branch from the release tag (or `main` if no divergence).
2. Minimal diff + test; `pnpm gate` green; human review; merge.
3. Patch release `v0.x.y+1`; deploy; note in the changelog.

## Ownership

| Step | Owner |
|---|---|
| Tag creation | human |
| Deployment | human (runbook) |
| Changelog | docs-keeper |
| Rollback decision | human + architect |
