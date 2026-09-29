# Changelog

All notable changes to TemuUNAIR. Format: Keep a Changelog. Releases follow
`docs/05-workflow/09-release-process.md`.

## [Unreleased]

### Added
- Repository bootstrap: blueprint, agent configuration (OpenCode), git workflow, lanes, CI
  skeleton, scripts, and the complete documentation set (product, design, architecture,
  contracts, workflow, quality, ops, course mapping).
- Contract set `1.0.0` (`docs/04-contracts/`): backend (BE-01..13) and frontend (FE-01..12)
  contracts derived from the blueprint.
- Architecture Decision Records ADR-0001..0010.

### Notes
- `packages/contracts`, `apps/*`, `services/ml` are specified but not yet implemented — M2/M3
  tasks deliver them.
- `docs/_source/proposal.pdf` and `docs/_source/logo.png` still need to be added by a human;
  docs that depend on them are marked `draft` with explicit `OPEN QUESTION` markers.

## Release template

```markdown
## [0.x.y] — YYYY-MM-DD
### Added
- …
### Changed
- …
### Fixed
- …
### Security
- …
```

Contract changes additionally appear in `docs/04-contracts/CHANGELOG.md` with the PR link.
