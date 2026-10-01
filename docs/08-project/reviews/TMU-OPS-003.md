---
id: REV-TMU-OPS-003
task: TMU-OPS-003
reviewer: reviewer
cycle: 2
date: 2026-10-01
verdict: APPROVE
---
# Review — TMU-OPS-003 (final: cycle 2 APPROVE; cycle 1 record preserved below)

Scope reviewed: `git diff origin/main...HEAD` (20 files: 16 in `apps/web`, `pnpm-lock.yaml`, 3 task docs) — commit `18a16d5` on claim `4655e5d`. Shell is well built, gate is green, i18n/privacy/lane checks pass; one test in the core i18n suite cannot fail.

## Findings

### BLOCKER
- none.

### MAJOR
- **F1 — placeholder-parity test is vacuous (never asserts anything).** `apps/web/src/i18n/messages.test.ts:51` appends a `"."` while recursing (`flatten(value, \`${prefix}${key}.\`)`) and `:48-49` returns that prefix for leaves, so **every** key from `flatten()` ends in a trailing dot (`"error.NOT_FOUND."`). `leafValue()` (`:54-63`) splits on `"."` → `["error","NOT_FOUND",""]`, then hits the `""` part with `node` already a string → returns `undefined`. The test at `:116-136` therefore hits `continue` for 100 % of keys and `expect([]).toEqual([])` always passes — placeholder parity is enforced by **neither** this test **nor** `scripts/i18n-check.mjs` (which documents placeholder parity per FE-08 §CI but does not implement it). The deliverable "identical ICU placeholders both locales" rests on eyeballing; a future edit that drops `{reason}` from `en` stays green. Data today is correct (I diffed all 30 notification strings by hand: `reportTitle`, `foundTitle`, `reason`, `senderName`, `place`, `at`, `claimShortId` match in both locales). Suggested fix: make `flatten` return keys without the trailing dot (leaf returns `prefix.slice(0, -1)`), keep the test body; optionally implement the placeholder row of FE-08 in `i18n-check.mjs` (ops lane).

### MINOR
- **F2 — task file bookkeeping behind reality.** `docs/08-project/tasks/TMU-OPS-003.md:4` still `status: IN_PROGRESS`, `:124` `PR: (pending)` although PR #10 exists, no Progress-log row for step 8 (PR), and two redundant `4 RED` rows (`:68`, `:69`). Precedent (`TMU-OPS-001`/`002` reviews) expects `status: REVIEW` + PR evidence at review time. Fix: orchestrator adds the PR row, flips status to `REVIEW`, drops the duplicate RED row.
- **F3 — hard-coded, invented metadata copy.** `apps/web/src/app/layout.tsx:12` `description: "Lost and found platform for Universitas Airlangga"` appears in neither `id.json`/`en.json` nor `docs/02-design/09-content-and-microcopy.md` (grep: 0 hits). AGENTS rule 9 (UI text in i18n files only). Fix: `metadata.description` key via `generateMetadata` + `getTranslations`, or record metadata as a documented i18n exception.
- **F4 — home page has no axe assertion.** `apps/web/src/app/page.test.tsx:15-37` renders the page without `axe()`; FE-12 §Component tests item 3 requires zero axe violations per component test (layout covers only the shell + a `Probe`, not `page.tsx`'s `<main>/<h1>`). Fix: add an axe run to `page.test.tsx`.
- **F5 — test files are typechecked nowhere.** `apps/web/tsconfig.json:19` excludes `**/*.test.{ts,tsx}`; root `tsconfig.json:9` (the only thing `pnpm gate` typechecks) includes only `scripts/**`. `next build` typechecks product code only. Type drift in the 3 new test files would pass the gate. Fix: a `tsconfig.test.json` (or drop the exclude) in `apps/web` — likely rides along with TMU-OPS-018.
- **F6 — theme.css only partially maps tokens.json.** `docs/02-design/tokens.json:36` (`font.weight` regular/medium/semibold/bold) and `:55-60` (`motion.fast/base/slow/reducedMotion`) have no `@theme` entries in `apps/web/src/styles/theme.css` — weights work only via Tailwind defaults (`page.tsx:9` `font-semibold`), duration/ease tokens do not exist yet for M3 components. Everything present (colors, font stacks, text scale, space, radius, shadow, breakpoints, `--z-index-*`) matches tokens.json exactly; z-index namespace `--z-index-sticky → z-sticky` is correct for Tailwind 4 (verified against upstream docs).

## Accepted deviations (documented, I agree)
- `dynamic = "force-dynamic"` on the root layout (`layout.tsx:8`) vs FE-01 `/` "static" — inherent to cookie/Accept-Language locale detection (`headers()`); reasoning sound, revisit only if landing CDN-caching matters (note, not a finding).
- Per-file `/** @jsxRuntime automatic */` pragma — spike-proven root-Vitest/tsconfig constraint, clean fix filed as TMU-OPS-018.
- Permission deviation (GREEN via `general` agent), notification copy source = `13-notification-and-email-templates.md` (BE-08 §line 14 names it authoritative; `09-…microcopy.md` and `SCR-013:46` disagree — pre-existing doc drift, out of `fe` lane), `next-env.d.ts` → TMU-OPS-018, e2e CI guard → TMU-OPS-017 — all recorded in task-file Notes.
- Out of scope honoured: no MSW harness, no dark tokens, no auth, no `infra/**`, no root-file edits.

## Checks run
- `pnpm test:unit -- apps/web/src` → **3 files / 10 tests passed** (messages 5, layout 3, page 2).
- `pnpm gate` → **`OK gate(quick) passed`**: lane check, format, lint, typecheck, `i18n:check passed (70 keys per locale)`, unit **5 files / 46 tests**, contracts/db steps pending no-ops.
- `git status --porcelain` → clean after gate (no `next-env.d.ts`, no stray artefacts); `git diff origin/main...HEAD --stat` → no changes to `packages/contracts`, `docs/04-contracts`, `.github`, root `package.json`.
- Manual cross-checks: BE-04 catalog (18 codes, `BE-04:18-35`), BE-08 types (15, `BE-08:19-29`), `09-content-and-microcopy.md:135-152` error copy (exact match), `13-notification-and-email-templates.md:30-118` notification copy (exact match), `SCR-001-landing.md:46-51` landing keys (exact match), `tokens.json` vs `theme.css`, `.agent/lanes.json` globs per changed file, `grep console.|https?://|@…` in `apps/web` → only `tsconfig.json:2` `$schema`.
- Not re-run: `next build` / `gate:full` (sandbox forbids the required `next-env.d.ts` cleanup) and `gh pr checks` (denied) — build greenness and PR CI status taken from task Evidence / unverified respectively.

## DoD checklist

| # | Item | Result | How |
|---|---|---|---|
| 1 | Red tests first, failed for right reason | Pass (caveat) | Task Evidence red block (missing JSON module, missing jsdom deps, probe errors); counts 5/3/2 match shipped files — no separate RED commit exists, so "unchanged from RED" is unverifiable beyond the task file |
| 2 | Tests pass; `pnpm gate` green | Pass | Re-ran gate: 46/46, i18n 70 keys |
| 3 | Contract checks for touched `API-*` | Pass (N/A) | No endpoints touched; BE-04/BE-08 key coverage asserted by `messages.test.ts:78-114` and `i18n:check` |
| 4 | Auth/RBAC; state transitions | N/A | Shell only; no routes/services |
| 5 | Privacy | Pass | Both JSON files: no emails, URLs, hint answers, geo, raw image URLs — templated `{…}` placeholders only |
| 6 | i18n `id` + `en`, `error.<code>` | Pass (data) / F1 (enforcement) | 70 keys per locale, parity test passes, placeholder enforcement vacuous → F1 |
| 7 | a11y | Pass with F4 | `layout.test.tsx:66-74` axe zero violations; `:43,:52` lang id→en asserted; page axe missing → F4 |
| 8 | Docs / Progress log / traceability | Pass with F2 | DoR waiver, 9-line plan, steps 0/1/4/5/7 logged, red+green evidence, all 6 required Notes present; status/PR rows → F2; traceability row = docs-keeper post-merge (precedent) |
| 9 | Generated files in sync, no hand edits | Pass | No `packages/contracts/generated/**` or `docs/04-contracts/**` in diff; `contracts:check` pending no-op |
| 10 | Reviewer verdict | This file | `REQUEST_CHANGES` on F1 (cycle 1 of max 2) |
| 11 | Security review (sensitive task?) | Pass (light) | No auth/uploads/PII surfaces; privacy spot-checks above |
| 12 | PR ready, CI green | Unverified | PR #10 exists; CI not queryable from sandbox; task file lacks PR row (F2) |
| — | Lane compliance (prompt §5) | Pass | All 20 paths match `fe` (`apps/web/**`, `**/*.test.tsx`) or `_common` (`docs/08-project/tasks/**`, `pnpm-lock.yaml`); `next-env.d.ts` **not** in the commit; gate lane-check green |
| — | No `console.log`, no raw tokens, no data fetching (prompt §3) | Pass | grep + `temuunair/no-console` lint rule green; `page.tsx` renders `t()` only |

## Notes for the human
F1 is a ~2-line fix in one test helper; the shipped message data is correct, so no product change is implied — but merge only after the parity test actually executes (or `i18n:check` grows the placeholder check). F2–F6 can ride the same fix commit or be filed as follow-ups per process (MINOR → follow-up task allowed). **Verdict: REQUEST_CHANGES (cycle 1) — one MAJOR (F1), five MINOR.**

---

# Review — TMU-OPS-003 (cycle 2)

Scope: `git diff 18a16d5..2520bfa` + working tree on `agent/fe/TMU-OPS-003-web-app-shell` (PR #10, draft). Cycle-1 findings F1–F6 all verified against the fix commit; gate re-run green. Read-only review — mutation for F1 re-traced statically, not re-executed.

## Finding resolution (cycle 1 → cycle 2)

| # | Sev | Verdict | Evidence |
|---|---|---|---|
| F1 vacuous placeholder test | MAJOR | **RESOLVED** | `messages.test.ts:51-53` now builds clean dotted paths (`prefix.length > 0 ? \`${prefix}.${key}\` : key`), so `flatten()` yields `error.NOT_FOUND`-style keys; `leafValue` (`:56-65`) resolves every one and the placeholder loop (`:121-137`) compares all 70 keys. Only hunk in that file vs `18a16d5`; parity `:73-78`, BE-04 `:80-96`, BE-08 `:98-116`, source-locale `:140-145` untouched → **no assertion weakened**. Mutation evidence at task `:128-132` (red `notification.ADMIN_DISPUTE.body: id=[claimShortId] en=[]` → restore → 5/5). Re-ran `pnpm test:unit apps/web/src` → **3 files / 11 tests pass**. |
| F2 task bookkeeping | MINOR | **RESOLVED** (new cosmetic regression → N1) | `status: REVIEW`, single merged RED row, COMMIT/REVIEW/fix rows, PR URL in Evidence. But the edit left duplicated GREEN/GATE rows → N1. |
| F3 invented metadata description | MINOR | **RESOLVED** | `layout.tsx:10-12` metadata is `{ title: "TemuUNAIR" }` only; invented `description` gone. |
| F4 page axe missing | MINOR | **RESOLVED** | `page.test.tsx:39-48` `it("has no axe violations")` → `expect(results.violations).toEqual([])`; suite = 3 files / **11 tests**; layout axe intact. |
| F5 tests not typechecked | MINOR | **RESOLVED (by filing — accepted)** | New AC in `TMU-OPS-018.md:54-57` + progress row. Ops lane, cross-lane MINOR → resolution-by-filing is per process. |
| F6 theme tokens incomplete | MINOR | **RESOLVED** | `theme.css:21-25` `--font-weight-*` = 400/500/600/700 (matches `tokens.json:36`); `:28-30` `--duration-*` = 120/200/320ms. **`@theme static` judged acceptable — keep it:** plain `@theme` prunes unused vars, so `var(--duration-base)` referenced by M3 would silently break; `static` guarantees emission for ~1 KB. Not a revert candidate. |

## New findings (cycle 2)

- **N1 — MINOR: duplicate Progress-log rows.** task `:69≡:74` (identical `5 GREEN`), `:70≡:75` (identical `7 GATE`). Cosmetic; orchestrator drops one pair when transcribing this review. **Not DoD-affecting — does not block.**
- **N2 — MINOR: misleading ease comment.** `theme.css:26` says "curve is the default ease-out", but Tailwind's default transition curve is `cubic-bezier(0.4,0,0.2,1)`; M3 should pair `duration-*` with the `ease-out` utility (which does equal CSS `ease-out`) — comment corrected in the final commit. Note only.
- **N3 — NOTE: cross-branch bookkeeping in `TMU-OPS-017.md`.** This fe-branch records that ops task's RED/GREEN evidence while its code lives on `47976c3` (verified via `git show 47976c3 --stat`). Lane-legal (`_common`); reconcile at merge (note added to that task file).

## Checks run (cycle 2)

- `git show 2520bfa --stat` → exactly **8 files** (4 `apps/web` + 4 docs); lane compliance all `fe`/`_common`; whole PR = 21 files, no root/`infra`/`.github` edits; no `next-env.d.ts`.
- `pnpm test:unit apps/web/src` → 3 files / 11 tests passed; `pnpm gate` → **`OK gate(quick) passed`**, `i18n:check` 70 keys, unit **47 passed (47)**; `git status` clean after gate.
- Message JSONs, `layout.test.tsx`, configs unchanged by the fix commit → no weakened/deleted tests, no contract files touched.
- Not verifiable from sandbox: `gh pr checks` (denied) → PR CI status unknown; `next build` not re-run (would create `next-env.d.ts`).

## DoD checklist (cycle 2)

| # | Item | Result | How |
|---|---|---|---|
| 1 | Red first, failed for right reason | Pass (same caveat as cycle 1) | Original red block at task `:108-120`; fix-batch red = F1 mutation at `:128-132` |
| 2 | Tests pass; `pnpm gate` green | Pass | Re-ran gate: **47/47** |
| 3 | Contract tests for touched `API-*` | Pass (N/A) | No endpoints; BE-04/BE-08 asserted + `i18n:check` |
| 4 | Auth/RBAC; transitions | N/A | Shell only |
| 5 | Privacy | Pass | Message JSONs untouched this cycle; no PII/logs |
| 6 | i18n `id`+`en`, `error.<code>` | Pass | 70 keys/locale; placeholder parity now actually enforced (F1) |
| 7 | a11y | Pass | layout axe + **page axe 0 violations** (F4) |
| 8 | Docs / Progress / traceability | Pass (N1 cosmetic) | status REVIEW, PR row, review+fix rows, mutation evidence |
| 9 | Generated files in sync | Pass | No contract generated files in diff |
| 10 | Reviewer verdict | This file | Cycle 2 of max 2 |
| 11 | Security review (sensitive?) | Pass (light) | No auth/upload/PII surface |
| 12 | PR ready, CI green | Partial | PR #10 draft; CI blocked on prerequisite TMU-OPS-017 (`47976c3`) |
| — | Lane / no drive-bys | Pass | See Checks above |

## Verdict

**APPROVE (cycle 2).** All six cycle-1 findings resolved (F5 filed into TMU-OPS-018); no BLOCKER/MAJOR remains; no new DoD-affecting issue. N1/N2/N3 are cosmetic/doc notes for the orchestrator and must not block merge. Follow-ups: TMU-OPS-017 (merge first for green CI), TMU-OPS-018 (shared-config hygiene).
