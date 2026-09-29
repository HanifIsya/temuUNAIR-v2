---
id: DOCS-README
title: Documentation index
status: approved
owner: DK
updated: 2026-09-29
depends_on: ["BLUEPRINT"]
source_refs: ["Blueprint §4"]
---

# TemuUNAIR documentation

The blueprint (`00-BLUEPRINT.md`) is the single source of truth. Everything here is generated
from it, in the order of the dependency graph (Blueprint §4.10).

| Folder | Contents | Owner |
|---|---|---|
| `00-BLUEPRINT.md` | The build blueprint | human |
| `_source/` | Raw proposal PDF + logo (read-only) | human |
| `01-product/` | PRD, vision, personas, stories, FR/NFR, acceptance, risks, roadmap | spec-writer |
| `02-design/` | Principles, brand, tokens, IA, flows, wireframes, screen specs, copy, a11y | spec-writer |
| `03-architecture/` | System design, ERD, state machines, ML, security, privacy, ADRs | architect / ml-dev / security-reviewer |
| `04-contracts/` | Backend (BE-xx) and frontend (FE-xx) contracts + governance | architect |
| `05-workflow/` | Git workflow, agent loop, playbooks, DoR/DoD, standards | orchestrator / git-steward |
| `06-quality/` | Test strategy, test cases, E2E, ML eval, budgets, checklists | qa-engineer |
| `07-ops/` | Local dev, deployment, backups, monitoring, incidents, admin guide | orchestrator |
| `08-project/` | Tasks, backlog index, status, traceability, decisions, blockers, reviews | docs-keeper |
| `09-course/` | Course deliverables: report mapping, demo script, report outline | spec-writer |

## Conventions

Every document carries front-matter:

```yaml
---
id: DOC-ID              # stable, never reused
title: Human title
status: draft | review | approved | superseded
owner: SW | AR | BE | FE | ML | QA | SR | OR | DK | GS
updated: YYYY-MM-DD
depends_on: [DOC-ID, ...]
source_refs: ["proposal.pdf §…", "DEC-###", "ADR-####", ...]
---
```

- **Approved = merged to `main` by a human.** Agents implement only from approved docs.
- Stable IDs: `US-###`, `FR-<MOD>-###`, `NFR-###`, `SCR-###`, `CMP-###`, `API-<GRP>-##`,
  `DB-###`, `ADR-####`, `TC-###`, `E2E-##`, `RISK-###`, `DEC-###`, `TMU-<LANE>-###`.
- Requirements use "The system shall …", MoSCoW priority, and Gherkin acceptance criteria.
- Docs in English; user-facing copy in Bahasa Indonesia (`id-ID`).

## Missing inputs (blocking some docs)

`docs/_source/proposal.pdf` and `docs/_source/logo.png` have not been added yet. Documents that
would cite them are marked `status: draft` with explicit `OPEN QUESTION` markers — see
`_source/README.md`.
