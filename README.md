# TemuUNAIR

> Lost Today, Found Together — a lost-and-found web platform for Universitas Airlangga with AI
> matching (text + photo + location + time).

**Start here:** [`docs/00-BLUEPRINT.md`](docs/00-BLUEPRINT.md) — the single source of truth for
how this repository is built.

| Where | What |
|---|---|
| [`docs/01-product/`](docs/01-product/) | PRD, vision, personas, user stories, FR/NFR, acceptance criteria |
| [`docs/02-design/`](docs/02-design/) | design principles, brand, tokens, IA, flows, wireframes, screen specs |
| [`docs/03-architecture/`](docs/03-architecture/) | C4, ERD, state machines, matching + ML design, security, ADRs |
| [`docs/04-contracts/`](docs/04-contracts/) | backend (BE-01..13) and frontend (FE-01..12) contracts |
| [`docs/05-workflow/`](docs/05-workflow/) | git workflow, agent loop, Orca/OpenCode playbooks, DoR/DoD |
| [`docs/06-quality/`](docs/06-quality/) | test strategy, test cases, E2E, ML eval, budgets, audits |
| [`docs/07-ops/`](docs/07-ops/) | local dev, deployment, backups, monitoring, incidents, admin guide |
| [`docs/08-project/`](docs/08-project/) | tasks, backlog, status, traceability, decisions, blockers, reviews |
| [`docs/09-course/`](docs/09-course/) | course deliverables: report outline and demo script |

## Status

Documentation and contracts are written; implementation (M3+) is pending. `docs/_source/` still
needs the proposal PDF and logo, added by a human. Open questions are marked `OPEN` or recorded
as DEC entries.

## Repository rules (short version)

1. Docs before code; contracts before implementation.
2. One task = one branch = one worktree = one PR.
3. Never push to `main`; never commit secrets; tests first.
4. All pushes go to **`https://github.com/HanifIsya/temuUNAIR-v2`** under the **HanifIsya**
   account.

Full rules: [`AGENTS.md`](AGENTS.md) and [`docs/05-workflow/`](docs/05-workflow/).
