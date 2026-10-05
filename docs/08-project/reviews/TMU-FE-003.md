---
id: TMU-FE-003
reviewer: reviewer
verdict: APPROVE
cycle: 2
date: 2026-10-05
---

# Review — TMU-FE-003 (cycle 2)

**Scope**: `git diff a29ffaa..HEAD` — 23 files (+578/−76), HEAD `73552e9`, branch
`agent/fe/TMU-FE-003-fe-wizard-photos`, working tree clean. Commits reviewed:
`aa010f9` (be import-depth + lanes + BLK-006), `9311904` (cycle-1 fixes B-1/M-1/n-5/n-7/n-9
+ docs), `379a907` (next-auth handler fix), `73552e9` (docs/CI evidence). This file replaces
the cycle-1 text; every cycle-1 finding is dispositioned below (the cycle-1 verdict itself is
preserved in `tasks/TMU-FE-003.md:141`). Fresh context; product code read-only — the only
file written is this one. Reviewed against FE-01/05/09/11/12, SCR-004, `WF-REVIEW`
(`docs/05-workflow/06-code-review-checklist.md`) and `05-definition-of-ready-done.md`;
cross-referenced the parallel `TMU-FE-003-security.md` (PASS) and `blockers/BLK-006.md`.

## Disposition of cycle-1 findings

| ID | Cycle-1 finding | Disposition | Evidence (file:line) |
|---|---|---|---|
| **B-1** | Wizard at `/report/new` vs merged FE-01 `/reports/new`; nav 404; middleware gate missed | **RESOLVED** | rename in `git diff --stat`: `…/(app)/{report => reports}/new/page.tsx` (similarity 100) + `page.test.tsx` (88); no singular remnant anywhere (`glob apps/web/src/app/**/report/**` → 0 files; grep `report/new` in `apps/` → 0 hits); nav already targeted the contract path — `features/shell/nav-items.ts:18,35` now resolves; cheap gate now covers it — `features/shell/guard.ts:6` `APP_AUTH_MATCHER` includes `/reports`; task paths corrected `tasks/TMU-FE-003.md:50,56`; dependent task corrected `tasks/TMU-FE-004.md:36`; test suite renamed `page.test.tsx:87` (`describe("reports/new wizard")`); no redirect shipped (correct — the singular path never merged) |
| **M-1a** | `WizardShell` step count not announced (`FE-09:43`) | **RESOLVED** | `components/report/wizard-shell.tsx:44` `role="status"` on `wizard-step-count`; asserted behaviourally at `wizard-shell.test.tsx:68`; axe run still green (`wizard-shell.test.tsx`, 7 tests green in reviewer run) |
| **M-1b** | `CategoryPicker` neither radio-group nor listbox, no arrow keys, stray `aria-pressed` (`FE-09:44`) | **RESOLVED** | native radios in a `fieldset/legend` — `category-picker.tsx:32-35,63-81`, shared group `name` from `useId` (`:28,74`), `checked`+`onChange` (`:76-77`); no `aria-pressed` left in the component (grep: only remaining occurrence in the app is `components/locale-switcher.tsx:40`, an unrelated FE-09 `LocaleSwitcher` row); arrow-key walk + selection asserted with user-event keyboard semantics `category-picker.test.tsx:129-139` (`{ArrowDown}` moves focus **and** fires `onChange("BAG")`), `checked` asserted `:84-91` and `:98-100`; page-level radio flow `page.test.tsx:109-117,137,206-212,237-240` |
| **M-1c** | `PhotoUploader`: label not a real button; progress unannounced; reason not linked (`FE-09:45`) | **RESOLVED** | real `<button data-testid="photo-uploader-add">` driving `inputRef.current?.click()` — `photo-uploader.tsx:56-64` (file input `:65-80`, `tabIndex={-1}` at `:74`), asserted `photo-uploader.test.tsx:78` + keyboard `:193-201` (assertion quality → n-10); progress `role="status"` on the status span `photo-uploader.tsx:118-124`, asserted `photo-uploader.test.tsx:100-106` (contains `40%`); rejection reason linked: `li[aria-describedby]` `:105` ↔ `p[id][role="alert"]` `:148-151`, asserted `:139-146`; errors still `role="alert"` `:151` |
| **M-1d** | `SensitiveNotice` `<aside>` ≠ `role="note"` (`FE-09:50`) | **RESOLVED** | `components/report/sensitive-notice.tsx:18` `role="note"` (explicit role overrides the implicit `complementary`); asserted `sensitive-notice.test.tsx:36` |
| **n-1** | `PENDING` from `API-UPL-02` rendered as "rejected" (latent) | **RESOLVED (recorded)** | task observation **O-4** `tasks/TMU-FE-003.md:111` (names the `TMU-CTR-*`), plus Deferrals `:122` |
| **n-2** | Server `rejectionReason` never reaches the user | **RESOLVED (recorded)** | task observation **O-5** `tasks/TMU-FE-003.md:112` (two-sided gap, BE then FE-004) + Deferrals `:122-123` |
| **n-3** | FE-11 `RATE_LIMITED` toast missing and undeclared | **RESOLVED (recorded)** | Deferrals `tasks/TMU-FE-003.md:119-120` — names n-3, the reason (no `ToastProvider`) and the target (FE-004) |
| **n-4** | FE-05 #5 / FE-01:55 leave-guard missing and undeclared | **RESOLVED (recorded)** | Deferrals `tasks/TMU-FE-003.md:121-122` — names n-4, notes the autosave mitigation, targets FE-004 |
| **n-5** | Steps ≥3: disabled Next with no explanation | **RESOLVED** | `features/report/report-wizard.tsx:85` `blockedHint()` now returns `report.wizard.step.pending` for `current > 2` (was `return null`); rendered by `wizard-shell.tsx:103-112` as `wizard-next-hint`; asserted at page level `page.test.tsx:172-175` (Next disabled **and** hint text); key exists in both locales `i18n/messages/id.json:173` / `en.json:173` |
| **n-6** | Hand-written MSW shapes in meta tests | **RESOLVED (recorded)** | Deferrals `tasks/TMU-FE-003.md:123-125` — names n-6, the mitigation (parity lock) and FE-004 preference for `mswHandlers` |
| **n-7** | Touch targets < 44 px (retry/remove, back/next) | **RESOLVED (wizard scope)** | `min-h-11` on photo add `photo-uploader.tsx:61`, retry `:130`, remove `:141`, category retry `category-picker.tsx:55`, category options `:66`, wizard back `wizard-shell.tsx:89`, next `:99`; asserted `photo-uploader.test.tsx:203-217`; systemic remainder (FE-002's identical buttons) recorded in Deferrals `tasks/TMU-FE-003.md:125-127` |
| **n-8** | FE-03 CMP-009/010/011 prop/event drift unrecorded | **RESOLVED (recorded)** | task observation **O-6** `tasks/TMU-FE-003.md:113` (all three shapes, FE-03 `TMU-CTR-*` at FE-004) + Deferrals `:123` |
| **n-9** | Evidence slips: "dropzone", 9-vs-10 file inconsistency | **RESOLVED** | `tasks/TMU-FE-003.md:74` now reads "button-triggered file picker"; grep `dropzone` in the task file → 0 hits; counts reconciled `:44-46` and `:153-155` (nine files/63 → 10 files/66 once `contract-parity` joined) vs cycle-1 red/green `:156-161` (`17 failed/44 passed` → 10 files/69) |

No cycle-1 finding is PARTIAL or NOT-ADDRESSED.

## Definition of Done (12 rows)

| # | Check | Result / evidence |
|---|---|---|
| 1 | Red tests existed first, failed for the right reason | **PASS** — `tasks/TMU-FE-003.md:148-161`: original red `Test Files 9 failed (9)` on unwritten modules, plus a **cycle-1 red** recorded before the fix commits: `Test Files 5 failed \| 4 passed (9)` / `Tests 17 failed \| 44 passed (61)`, each failure an M-1/n-5/n-7 assertion (radios, roles, `aria-describedby`, `min-h-11`, step-3 hint). Reviewer cannot replay red without rewriting history; the 17 red assertions correspond to the 17 now-green assertions I re-ran |
| 2 | All new/updated tests pass; full `pnpm gate` green | **PASS with environment caveat (disclosed)** — reviewer run of the four FE-003 paths → **10 files / 69 tests green**; full `pnpm test:unit` → 73 files, **62 passed / 11 failed**, the 11 being live-DB suites failing on the session `DATABASE_URL` (remote Render host, `code: '57P01'`, D-7 — identical shape to cycle 1), **zero FE-003-scoped failures**. `pnpm gate` **could not be run by the reviewer** (see Verification runs) → gate status rests on the implementer's recorded tails (`:139` `OK gate(quick) passed` 73/577; `:144` full gate green, 73/580 in commit `379a907`) and on CI. No test weakened: the diff changes assertions only where the DOM semantics changed (button→radio), adds 3 photo-uploader tests, and contains no `.only`/`.skip` (grep, 0 hits in `*.test.tsx`) |
| 3 | Contract tests for every touched `API-*` | **PASS** — no endpoint behaviour changed (the five touched routes are one-line re-exports); reviewer ran the contract-facing suites green: `contract-parity.test.ts` (3 — real `ReportCreate`/`CategoryMeta` through the non-literal import), `use-categories.test.tsx` (2 — `API-META-01` success + failure envelope), `use-upload.test.tsx` (8 — BE-10 handshake against generated `mswHandlers`) |
| 4 | Auth/RBAC asserted; state transitions covered | **PASS with note** — page runs under the `(app)` guard and now also inside the middleware cheap gate (`guard.ts:6`); transitions covered: `page.test.tsx` (advance/block FOUND until a photo is ready, draft save/restore, step-3 block) + `wizard-steps.test.ts` (LOST 5 / FOUND 7 gates). **Note:** the fixed auth route has no test of its own → n-11 below |
| 5 | Privacy: no hint answers/emails/embeddings/sensitive URLs logged or returned | **PASS** — the cycle-2 diff introduces no logging, no new data flow and no new persistence: only roles, refs, classes and i18n lookups in `apps/**`; grep of the new hunks shows no `console.*`, no URL/PII material; `BLK-006.md` records no credentials and none appear in the diff; the parallel security review (PASS) stands and its handoffs were carried into cycle 1 |
| 6 | i18n keys in `id` + `en`, incl. `error.<code>` | **PASS** — the fixes add **no new keys** (they reuse existing ones); the one newly referenced string `report.wizard.step.pending` exists in both locales (`id.json:173`, `en.json:173`); no literal UI strings added to JSX (grep). Implementer's `i18n:check passed (147 keys per locale)` (`:138`) is unrerunnable here (permission) |
| 7 | A11y: states + keyboard path + zero axe violations | **PASS** — 4 `axe(container)` runs green inside the reviewer's focused run (wizard-shell, category-picker, photo-uploader, sensitive-notice), **plus** behavioural assertions for every row axe cannot check: `wizard-shell.test.tsx:68`, `category-picker.test.tsx:129-139` (arrow-key radio walk), `photo-uploader.test.tsx:100-106,139-146,203-217`, `sensitive-notice.test.tsx:36`, `page.test.tsx:172-175` |
| 8 | Docs: task status, Progress log, evidence, CHANGELOG (contracts) | **PASS with n-12** — status `REVIEW`, Progress steps 8–11 (`:141-144`), Evidence block (`:146-185`), Deferrals and O-4…O-6 all present; `TMU-FE-004.md` cross-ref fixed; **no `docs/04-contracts/**` change → no CHANGELOG entry required** (correct: all FE-09 fixes implement already-merged contract rows) |
| 9 | Generated files in sync, no hand edits | **PASS** — the 23-file diff contains no `packages/contracts/generated/**`, no `BE-02-openapi.yaml`, no `msw-handlers.ts`, no `.opencode/**`/`opencode.json`; CI `contracts` job green on head |
| 10 | Fresh-context reviewer verdict in this file | **PASS** — this file, cycle 2, fresh context |
| 11 | Security review for a sensitive task | **PASS** — parallel `TMU-FE-003-security.md` verdict PASS; `BLK-006.md` records both human answers and matches the diff exactly (see Notes) |
| 12 | Every touched path inside `.agent/lanes.json` | **PASS (logic replicated, script not runnable)** — see Verification runs #6: all 44 files of `git diff main...HEAD` fall under `fe` globs or `_common`; `.agent/lanes.json` gained **exactly 6** explicit paths and nothing else |

## New findings (cycle 2)

No BLOCKER, no MAJOR. Four MINORs (non-blocking; per DoD they must be **filed**, not
silently dropped — suggested homes given):

- **n-10 — the "keyboard operable" test does not prove the button opens the picker.**
  `components/report/photo-uploader.test.tsx:193-201`: after `{Enter}` it asserts
  `expect(screen.getByTestId("photo-uploader-input")).toBeTruthy()`, which is true even if
  `onClick` were removed (the input is always rendered). The implementation is correct
  (`photo-uploader.tsx:60`), but the FE-09 "real `<button>` opens the picker" row rests on
  that vacuous assertion. *Direction:* spy on `input.click()`/`onChange` (or assert via
  `user.upload` after the Enter). MINOR — the row is covered elsewhere by the button-presence
  and upload tests; file with TMU-FE-004.
- **n-11 — the fixed next-auth route has no test (severity: MINOR, not MAJOR).**
  `app/api/auth/[...nextauth]/route.ts:17,47` dispatches `{handlers}.POST/GET` by
  `request.method`; grep across `apps/` finds **zero** test references to that route
  (pre-existing: it had none before the fix either). Rated MINOR because: (a) the defect and
  the absence of a test both predate this diff — the diff *repairs* a broken route; (b) the
  fix was explicitly human-authorized as a one-file minimal change (`BLK-006.md:58-76`,
  answer "Authorize this one-file fix"); (c) a route test (`*.test.ts` under `app/api/**`)
  would itself need a be-lane exception, so the omission is lane-driven, not neglect;
  (d) `next build` typechecks the dispatch (CI `build` green on head) and next-auth
  β29's object return is verified in `BLK-006.md:63-65`. *Direction:* file a small be-lane
  follow-up (assert GET/POST dispatch + the rate-limit error envelope).
- **n-12 — two task-file bookkeeping slips.** (a) `tasks/TMU-FE-003.md:87-89` lists the five
  `meta/uploads` routes under **Files changed** but omits the sixth be-lane file actually
  touched, `app/api/auth/[...nextauth]/route.ts` (it *is* disclosed at `:144`, `BLK-006.md`
  and `:185` — the list is just incomplete); (b) the Evidence **Gate tail** (`:162-165`)
  still shows the pre-fix `73 files / 577 tests` while Progress step 11 and commit
  `379a907` record the post-fix `73 files / 580 tests`. *Direction:* one-line edits when the
  task file is next touched.
- **n-13 — the sr-only file input duplicates the visible button's accessible name.**
  `components/report/photo-uploader.tsx:56-69`: the `<button>` text and the input's
  `aria-label` (`:69`) are the same string, so a screen-reader virtual cursor meets two
  adjacent controls called "Tambah foto". axe is green and the input is correctly
  non-tabbable (`tabIndex={-1}`, `:74`), so nothing breaks. *Direction:* either drop the
  `aria-label` or exclude the inert input from the accessibility tree (verify axe stays
  green); fold into the FE-004 a11y pass.

## Verification runs (reviewer-executed, 2026-10-05)

1. **Focused FE-003 suite** — `pnpm test:unit apps/web/src/components/report
   apps/web/src/features/report apps/web/src/hooks "apps/web/src/app/(app)/reports"` →
   `Test Files 10 passed (10)` / `Tests 69 passed (69)` (page 6, photo-uploader 17,
   category-picker 8, wizard-shell 7, use-upload 8, draft 8, wizard-steps 8,
   contract-parity 3, use-categories 2, sensitive-notice 2).
2. **Full unit suite** — `pnpm test:unit` →
   `Test Files 11 failed | 62 passed (73)`, `Tests 1 failed | 448 passed | 131 skipped (580)`.
   Every error I sampled is a Postgres `FATAL … code: '57P01' terminating connection`
   from the **remote** Render host named in the session `DATABASE_URL` (D-7 env drift, not
   this diff); a targeted `pnpm test:unit tests/db …` run reproduced it as
   `6 failed | 3 passed (9)` with `tests/db/{reports-base,ops-seeds,claims-chat}.test.ts`
   failing — i.e. the failures are confined to live-DB suites. Zero FE-003-scoped failures.
   (The session's DB URL embeds a credential that vitest echoes in those error dumps; I am
   not reproducing it here — pre-existing D-7/ops concern, outside this diff.)
3. **Gate — attempted, NOT runnable by me.** `pnpm gate` →
   `WSL (8991 - Relay) ERROR: CreateProcessCommon:817: execvpe(/bin/bash) failed: No such
   file or directory` / `ELIFECYCLE Command failed with exit code 1`. The suggested
   fallbacks — `& "C:\Program Files\Git\bin\bash.exe" scripts/gate.sh quick`,
   `scripts/check-lane.sh` and `gh pr checks 46` — are **denied by my permission
   allow-list** (only `git status/diff/log/show`, `pnpm gate*`, `pnpm test*` pass).
   **Disclosed, not silently skipped:** gate status rests on the implementer's recorded
   tails plus CI, and the lane check on the manual replication below.
4. **CI on the actual head** — `gh pr checks` blocked, so I queried the public GitHub API
   check-runs for head `73552e9` (run `37261312155`, PR #46): `build` success, `e2e`
   success, `unit` success, `lint-typecheck` success, `contracts` success, `contract-fuzz`
   success, `integration` success, `migrations` success, `ml` success, `secret-scan`
   success, `docker-build` skipped, `audit` **failure** — advisory only
   (`.github/workflows/ci.yml:171` `continue-on-error: true`, pre-existing next-auth/next-intl
   advisories per security M-6). The task's cited run `37261127595` (head `379a907`) is the
   preceding green run; both are green, so Evidence `:182-185` is accurate.
5. **Diff hygiene** — `git diff a29ffaa..HEAD --stat` (23 files, list reviewed hunk by
   hunk): no generated files, no secrets, no `--no-verify` in any commit subject/body
   (`git log a29ffaa..HEAD --format=%B` — all four are Conventional Commits with
   `Task: TMU-FE-003` trailers plus `Refs:`/`Agent:`), no `.only`/`.skip` (grep → 0),
   no drive-by refactors; the task-file diff (`git diff a29ffaa..HEAD -- docs/…/TMU-FE-003.md`)
   only corrects paths/wording and appends O-4…O-6, deferrals, steps 8–11 and Evidence —
   no acceptance criterion was weakened.
6. **Lane (check-lane logic replicated by hand — script itself not runnable, see #3)** —
   `git diff --name-only main...HEAD` → 44 files; each matched against `.agent/lanes.json`
   `fe` globs + `_common`: app/pages/components/features/hooks/lib/i18n under `fe`; the 6
   `app/api/**` files under the **new explicit fe entries**; `.agent/lanes.json`,
   `pnpm-lock.yaml`, `docs/08-project/{tasks,reviews,blockers}/*`, `backlog.md`, `status.md`
   under `_common`; `apps/web/package.json` in both `fe` and `be` (overlap allowed).
   **Out-of-lane edits: 0.** The `.agent/lanes.json` diff is exactly
   `+6` lines (`app/api/auth/[...nextauth]/route.ts`, 4 × `v1/meta/*/route.ts`,
   `v1/uploads/[id]/complete/route.ts`) and nothing else.
7. **Route-depth regression check** — each of the five one-line diffs adds exactly one `../`
   and is otherwise byte-identical; hand-resolved: `app/api/v1/meta/<x>/route.ts` +
   `../../../../../server/handlers/meta` → `apps/web/src/server/handlers/meta.ts` (exists);
   `app/api/v1/uploads/[id]/complete/route.ts` + `../../../../../../server/handlers/uploads`
   → `apps/web/src/server/handlers/uploads.ts` (exists). The ad-hoc `scan-routes.js` from
   `BLK-006` is not committed, so I could not re-run the scanner — CI `build`/`e2e` green on
   head is the equivalent proof. The other 6 API routes were not touched.
8. **Greps** — `report/new|"/report` in `apps/` → only unrelated `report-*` module names;
   `aria-pressed` → `locale-switcher.tsx` only; `dropzone` in the task file → 0;
   `continue-on-error` → `.github/workflows/ci.yml:171`; i18n `pending` → both locales.

## Notes

- **BLK-006 vs the diff — record matches exactly.** Authorization 1 ("Authorize lane
  exception") → 5 explicit `route.ts` paths added to the fe lane + one `../` per import
  (`aa010f9`); authorization 2 ("Authorize this one-file fix") → 6th path + `{handlers}`
  dispatch by `request.method` with a `NextRequest` parameter (`379a907`,
  `route.ts:7,17,47`). Nothing beyond those two authorizations was changed in be-lane code:
  the five imports are single-character diffs and the auth route changes only the dispatch
  line and the parameter type. `BLK-006.md` status `resolved`, follow-up item 3 (keep or
  re-home the 6 paths) correctly left open for ops.
- **Regression judgement on the two be-lane fixes:** both are strictly improvements
  (broken module resolution → resolves; runtime `TypeError` on every `/api/auth/*` →
  dispatches). The import files carry no logic; the auth route's behaviour before the fix
  was "throw", so no previously-working path changed.
- **What I deliberately did not re-open:** the pre-fix implementation approved in cycle 1
  (draft schema/parity lock, FE-04 retry/staleTime, BE-10 handshake, i18n key set, privacy
  shape) — cycle 2 reviews the fixes and the new diff only.
- **Security:** no new endpoint, no new data flow, no authz change beyond the page moving
  *into* the middleware `/reports` cheap gate; the parallel security review's handoffs
  (route drift → B-1 resolved; gate re-run → attempted again, environment-blocked;
  advisory audit job → confirmed `continue-on-error`; FE-004 privacy re-check → still open
  for FE-004) are all accounted for.
- Review-cycle budget: **2 of 2 used** (`05-definition-of-ready-done.md`). The four MINORs
  above must be filed as follow-ups (n-10/n-12/n-13 → TMU-FE-004; n-11 → a be-lane test
  task) — none blocks this PR.

## Verdict

**APPROVE.** Both cycle-1 blocking findings are genuinely fixed and verified behaviourally,
not cosmetically: **B-1** now lives at the contract URL `/reports/new` (git rename, zero
singular remnants, nav and middleware gate both match, dependent task corrected), and
**M-1**'s four FE-09 rows are implemented with tests that assert the semantics themselves —
`role="status"` step count and upload progress, a native radio group walked with arrow keys
in a `fieldset` (the stray `aria-pressed` pattern is gone), a real `<button>` opening the
picker with the rejection reason `aria-describedby`-linked and errors still `role="alert"`,
and `role="note"` on the sensitive notice — plus the n-5 pending hint and n-7 44 px targets,
all nine minors dispositioned (four recorded as O-4…O-6, four in Deferrals, two fixed with
their evidence corrected). I re-ran the FE-003 suite (10 files / 69 tests green) and CI on
the actual head commit (all required jobs green; `audit` advisory only); the two human
authorizations in BLK-006 correspond one-to-one with what the diff did, lane membership
checks out by manual replication, and no generated file, secret, weakened assertion or
out-of-lane edit appears anywhere. Honest caveats: I could not execute `pnpm gate` or
`scripts/check-lane.sh` in this environment (WSL `bash` missing and the `git bash`
invocation denied by my permission rules) and `gh pr checks` was likewise denied, so those
three verifications rest on the implementer's recorded tails, my manual replication of the
lane logic, and the GitHub check-runs API respectively. The four new findings are MINOR and
non-blocking; file them as follow-ups before marking the task DONE.
