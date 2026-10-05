---
id: TMU-FE-003
reviewer: reviewer
verdict: REQUEST_CHANGES
cycle: 1
date: 2026-10-05
---

# Review — TMU-FE-003

**Scope**: `git diff 9df6156..a29ffaa` (33 files, HEAD `a29ffaa`, branch
`agent/fe/TMU-FE-003-fe-wizard-photos`, tree clean — only the parallel security review and
this file are untracked). Fresh context; read-only for product code; this file is the only
artefact written. Reviewed against `docs/08-project/tasks/TMU-FE-003.md` (ACs, D-1..D-7,
O-1..O-3), FE-01/02/03/04/05/06/08/09/11/12, SCR-004, BE-01/04/10/12, `.agent/lanes.json`
and `docs/05-workflow/05-definition-of-ready-done.md`. Cross-referenced the parallel
`TMU-FE-003-security.md` (verdict PASS) and took over its handoff items.

## Checklist (DoD)

| # | Check | Result |
|---|---|---|
| 1 | Red evidence existed first and failed for the right reason | PASS — task L121/L130: `Test Files 9 failed (9)`, every file failing on a not-yet-written module; `contract-parity.test.ts` added later is disclosed at L46 and L123. Reviewer cannot replay red without rewriting history; the claim is internally consistent (see MINOR n-9 for one count slip) |
| 2 | All new/updated tests pass; full `pnpm gate` green | PASS (env caveat disclosed) — reviewer re-ran the FE-003 suite: **10 files / 66 tests green**, plus `apps/web/src/i18n` (5 tests) green. Full `pnpm test:unit` → 62/73 files pass; the 11 failures are **only** live-DB suites (`role "temuunair" does not exist` ×10 suites, 1 `db:check` test) — the D-7 remote-`DATABASE_URL` drift, not this diff. `pnpm gate` was attempted by the reviewer and cannot run in this environment (`WSL … execvpe(/bin/bash) failed` — bash shim absent; `i18n:check`/lint/typecheck and `gh` are blocked by reviewer permission rules), so the gate rests on the recorded tail (L125/L136-139: `73 files / 577 tests`, `contracts:check OK (1.1.0)`, `db:check: ok`, `OK gate(quick) passed`) and CI, which the reviewer could not query. **No test was weakened**: the diff touches no pre-existing test file (name-only list) and contains no `.only`/`.skip` |
| 3 | Contract tests for every touched `API-*` | PASS — `contract-parity.test.ts:16,36-38` loads the *real* `ReportCreate`/`CategoryMeta` through the non-literal dynamic import (reviewer ran it green, proving no alias/mock shadowing) with sample-for-sample parity incl. failure cases and parsed output (`:50-96`); upload handshake asserted against generated `mswHandlers` with captured `x-requested-with` + `idempotency-key` (`use-upload.test.tsx:55`); `API-META-01` success + failure envelope exercised (`use-categories.test.tsx`) |
| 4 | Auth/RBAC asserted; state transitions covered | PASS with note — page runs under the `(app)` layout guard (`getAppUser()` → `/login`, `layout.test.tsx`); wizard transitions tested (`page.test.tsx` advances/blocks FOUND until a photo is ready, restores draft; `wizard-steps.test.ts` LOST 5 / FOUND 7 gates). **Note**: the middleware cheap gate misses this page (folded into B-1) |
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs returned/logged | PASS — zero `console.*`/log calls in the diff (grep, eslint `no-console`); the only `localStorage` writer stores `{type, category, imageIds}` (`report-wizard.tsx:53`, `draft.ts:28-38`); presigned PUT URL kept as a local variable, `thumbUrl` in memory only; fixtures synthetic. Agrees with the security review rows 1/3/5/12 |
| 6 | i18n keys in both `id` and `en`, incl. `error.<code>` | PASS — +48 keys per locale (`report.wizard.*`, `category.*`, `sensitive.notice.*`) under FE-08's declared namespaces (FE-08:20-22); `messages.test.ts` green (key parity, every BE-04 code, identical ICU placeholders); reviewer spot-checked every key the new code references (`common.back/next/retry/unknownError/offline`, `report.wizard.stepOf/step.*.title/needCategory/photos.*`, `error.UPLOAD_*`) exists in both locales. `pnpm i18n:check` not runnable by the reviewer (permissions); implementer recorded `i18n:check passed (147 keys per locale)` |
| 7 | A11y: states + keyboard path + zero axe violations | **CONCERN → MAJOR M-1** — 4 `axe(container)` runs green (`wizard-shell.test.tsx:164`, `category-picker.test.tsx:135`, `photo-uploader.test.tsx:183`, `sensitive-notice.test.tsx:41`) and keyboard tests pass, but axe does not check live regions/roles: four FE-09 component rows are unmet (announcement, control semantics, `role="note"`) |
| 8 | Docs updated: status, Progress log, evidence, CHANGELOG (contracts) | PASS with MINOR n-9 — task status `REVIEW`, DoR/AC boxes, D/O/deferral tables, Progress log and Evidence all present; backlog/status regenerated; traceability covered by goal row G1 (`traceability-matrix.md:20`, SCR-004 + API-UPL/META already listed); no `docs/04-contracts/**` change → no CHANGELOG entry required (correct) |
| 9 | Generated files in sync, no hand edits | PASS — the name-only diff contains **no** `packages/contracts/generated/**`, `BE-02-openapi.yaml`, `msw-handlers.ts` or `.opencode/**`/`opencode.json`; `contracts:check OK (1.1.0)` recorded (not re-runnable here) |
| 10 | Fresh-context reviewer verdict in this file | PASS — this file, cycle 1 |
| 11 | Security review for a sensitive task (uploads/privacy) | PASS — parallel `TMU-FE-003-security.md` verdict PASS (gitleaks clean, no secrets, upload/presign/draft privacy audited). Reviewer took over its 5 handoffs (see Notes) |
| 12 | Lane: every touched path inside `.agent/lanes.json` | PASS — all 33 files are under `fe` globs (`app/(app)/**`, `app/*.tsx`, `components/**`, `features/**`, `hooks/**`, `lib/**`, `i18n/**`) or `_common` (`apps/web/package.json`, `pnpm-lock.yaml`, `docs/08-project/{tasks,backlog,status}.md`); no ops/contracts/DB/migration/`.opencode` file touched |

## Findings

### BLOCKER

**B-1 — The wizard is implemented at `/report/new`, but the merged route contract (and the
app's own shipped nav) say `/reports/new`.**

- Implemented: `apps/web/src/app/(app)/report/new/page.tsx` — the **only** page under
  `(app)`; prescribed by the task file itself (`tasks/TMU-FE-003.md:50` "expected",
  `:56` "changed"), so assignment and contract disagree.
- Contract (merged, law): `FE-01-route-map.md:22` `/reports/new?type=lost|found`, repeated in
  `FE-02:58`, `FE-05:23,33`, `FE-06:20`, `FE-01:55`; approved screen spec
  `SCR-004-report-wizard.md:11`; `04-information-architecture.md:21-22`;
  `06-wireframes.md:23`. No contract anywhere lists a singular `/report/new`.
- Already-merged code points at the contract path: `features/shell/nav-items.ts:18,35`
  (top- and bottom-nav "Lapor"), asserted by `components/nav/bottom-nav.test.tsx:65,85,88`,
  `top-nav.test.tsx:98`, `features/shell/nav-items.test.ts:28,43`,
  `features/auth/next-path.test.ts:9`.
- Effect: the primary "Lapor" CTA (and SCR-003's dashboard exits) **404** — no redirect in
  `apps/web/next.config.ts`, no route alias; `bottom-nav.test.tsx:85-88` expects
  `aria-current="page"` at `/reports/new`, which can never match. This is both contract
  drift (behaviour not in a merged contract — AGENTS.md hard rule 1) and a broken
  integration with merged FE-002 code.
- Secondary: the middleware cheap gate skips the page — `features/shell/guard.ts:6`
  `APP_AUTH_MATCHER` lists `/reports` but not `/report`. The authoritative check in
  `(app)/layout.tsx` still applies (not an authz hole; the security review row 8 agrees),
  but the defence-in-depth layer is missing for the wizard.
- Fix (pick one, then update the task file): **(preferred)** rename
  `app/(app)/report/new` → `app/(app)/reports/new` and correct task-file L50/L56/evidence;
  **or**, if the singular path were genuinely intended, a `TMU-CTR-*` FE-01 change plus
  nav/SCR/IA updates (not recommended — `/reports` browse and `/reports/new` coexist
  fine in the App Router). Do **not** ship an undocumented redirect.
- Loop: BLOCKER → back to step 5.

### MAJOR

**M-1 — Four of the five wizard components miss their FE-09 component requirements;
axe-green does not discharge them.**

| Component | FE-09 requirement | Implemented | Gap |
|---|---|---|---|
| `WizardShell` | "step count announced (Langkah 3 dari 5)" (`FE-09:43`) | plain `<p data-testid="wizard-step-count">` — `components/report/wizard-shell.tsx:44-46` | no `role="status"`/`aria-live`; SR users never hear the step count (focus-move to heading `:37-39,72-79` is correct ✓) |
| `CategoryPicker` | "radio-group semantics **or** listbox with keyboard arrow navigation; selected announced" (`FE-09:44`) | `fieldset/legend` + toggle buttons with `aria-pressed` — `components/report/category-picker.tsx:61-75` | keyboard-operable via Tab (`category-picker.test.tsx:125-133` ✓) but neither permitted pattern and no arrow-key roving focus; `aria-pressed` is the `ReportFilterBar` pattern (`FE-09:40`), not this component's |
| `PhotoUploader` | "real `<button>` opens the picker; progress announced; rejection reason linked" (`FE-09:45`) | `<label>` + `sr-only <input type=file>` `photo-uploader.tsx:54-68`; progress `%` in a plain `<span>` `:38-41,106`; error `<p role="alert">` `:129-138` | not a real button; progress never announced; alert is announced but not `aria-describedby`-linked to the item — and the "reason" is always the generic string `report.wizard.photos.rejected` `:32` (see n-2) |
| `SensitiveNotice` | "`role="note"`" (`FE-09:50`) | `<aside>` — `components/report/sensitive-notice.tsx:15-19` | `<aside>` = implicit `complementary`, not `note` |

The four `axe` runs (`wizard-shell.test.tsx:164`, `category-picker.test.tsx:135`,
`photo-uploader.test.tsx:183`, `sensitive-notice.test.tsx:41`) are green and keyboard paths
are tested, but axe does not verify live regions, control semantics or `aria-describedby` —
so DoD row 7's evidence does not cover these rows. All four fixes are small (live region on
the count and on progress, `role="note"`, `aria-describedby`, radio/roving-focus group); if
a deviation is *intended*, it must be recorded as an FE-03/FE-09 `TMU-CTR-*` change instead
of silent divergence.

### MINOR

- **n-1 (latent state machine) — `PENDING` from `API-UPL-02` is rendered as "rejected".**
  `hooks/use-upload.ts:127-135` maps any non-`READY` complete response to
  `phase:"rejected"`, but `API-UPL-02Response.status` allows `PENDING`
  (`BE-02-openapi.yaml:3674-3679`) and `BE-10:20` says "poll `UploadState` while
  processing". Today's server never does — `server/services/uploads.ts:150-228` completes
  synchronously to READY/REJECTED (idempotent replay `:158`) — and the FE contract has no
  PENDING state (`FE-03:29`, `FE-06:50`), so nothing is broken in production. Latent only:
  if BE ever makes `complete` async the UI shows a false "rejected" with no retry path
  (retry is offered only for `phase:"failed"`, `photo-uploader.tsx:107`). Record as a task
  observation → `TMU-CTR-*` (drop `PENDING` from the complete response, or specify the FE
  poll).
- **n-2 — server `rejectionReason` never reaches the user.** `BE-10:58` defines
  `rejectionReason` ("i18n key when REJECTED") and `FE-06:50`/`FE-03:70` promise
  `rejected(reason)`; the client discards it (`use-upload.ts:133-135`) and always renders
  the generic string (`photo-uploader.tsx:32`). The server omits it too
  (`server/services/uploads.ts:116-121` `toState` returns `{id,status,mime,thumbUrl}`) —
  a two-sided gap: BE/`TMU-CTR-*` follow-up, then FE-004 wiring. Users cannot tell *why* an
  image was rejected.
- **n-3 — FE-11 `RATE_LIMITED` behaviour missing and not declared deferred.** `FE-11:33`
  requires "toast with countdown from `Retry-After`"; upload init is rate-limited
  (BE-12 30/h) and the code only renders inline `error.RATE_LIMITED`
  (`photo-uploader.tsx:34`). No `ToastProvider` exists yet, and the Deferrals block
  (`tasks/TMU-FE-003.md:109-113`) does not list it → add it there (or to FE-004) so it is
  not lost.
- **n-4 — FE-05 #5 leave-guard absent and not declared deferred.** `FE-05:60` and
  `FE-01:55` require a confirm dialog when leaving the wizard with a draft;
  `report-wizard.tsx` has no router block/`beforeunload`. No data loss (draft autosaves on
  step change, `report-wizard.tsx:89-99`) — but the requirement is unmet and unlisted in
  Deferrals → track explicitly for FE-004.
- **n-5 — steps ≥3 are a dead end: disabled Next with no explanation.**
  `report-wizard.tsx:76` forces `canProceed=false` for `current>2` and `blockedHint()`
  (`:78-86`) returns `null`, so `wizard-shell.tsx:103` renders no hint. Steps 1–2 do this
  correctly (`:78-87`); add a pending hint for `current>2` (D-6 discloses the pending body,
  not the silent control).
- **n-6 — hand-written MSW response shapes.** `FE-12:36` / `FE-04:124`: "tests never
  hand-write response shapes". `app/(app)/report/new/page.test.tsx:47-49` overrides the
  generated handler with `HttpResponse.json(CATEGORIES)` and
  `features/report/use-categories.test.tsx:49-50` hand-writes the 500 envelope. Mitigated:
  the success path is parsed by `categoryListSchema` (`use-categories.ts:30`), which is
  parity-locked to the contract (`contract-parity.test.ts:79-96`), and the error shape only
  exists because `API-META-01` declares `errors: []` (task O-1). Upload endpoints correctly
  use generated `mswHandlers` — prefer that pattern here too.
- **n-7 — touch targets below FE-09 #5 (≥44×44 px, `FE-09:25`).** retry/remove
  (`photo-uploader.tsx:113,123`, `py-1` ≈ 28 px) and back/next (`wizard-shell.tsx:89,99`,
  `py-2` ≈ 36 px). Systemic (FE-002's buttons look identical) → design/token follow-up, not
  wizard-specific; axe does not catch it here.
- **n-8 — FE-03 CMP-009/010/011 prop/event contract drifted.** `FE-03:27` gives
  `WizardShell` an `onSaveDraft` event (implementation saves from `report-wizard.tsx:89-99`
  instead); `FE-03:29` gives `PhotoUploader` an `onError` event (absent from
  `photo-uploader.tsx:7-15`) and types `value: UploadState[]` while the component takes the
  local `PhotoEntry[]` superset with `phase` instead of `status` (`use-upload.ts:12-22`);
  `FE-03:28` says CategoryPicker is an "icon grid" (rendered as a text grid). Behaviour is
  covered, but the divergence is unrecorded → add a decision/observation (and an FE-03
  `TMU-CTR-*` if the shapes are meant to change).
- **n-9 — evidence/doc slips.** Task `:134-135` says "`Test Files 9 passed (9)`, `Tests 66
  passed (66)` … (10 files incl. `contract-parity.test.ts`)" — 9 vs 10 inconsistency
  (`:46` states it correctly: 9 files/63 tests → 10 files/66); `:74` calls
  `photo-uploader` a "dropzone" but the component has no drag-and-drop (label + file input,
  which FE-03 explicitly allows — "not drop-zone only"; the code is right, the description
  is not).

## Verification runs (reviewer-executed)

- `git diff 9df6156..a29ffaa --name-only` (33 files), `git status`, `git log` — lane,
  scope and "no generated files" checks; `git show a29ffaa:<path>` for per-file review.
- `pnpm test:unit` on the FE-003 paths → **10 files / 66 tests passed** (page 6,
  photo-uploader 14, category-picker 8, wizard-shell 7, use-upload 8, sensitive-notice 2,
  use-categories 2, draft 8, wizard-steps 8, contract-parity 3).
- `pnpm test:unit apps/web/src/i18n apps/web/src/lib/api` → 1 file / 5 tests passed
  (locale parity, BE-04 `error.*`, BE-08 notification keys, ICU placeholders, id-as-source).
- `pnpm test:unit` (full) → 73 files: 62 passed, 11 failed — **all** live-DB suites failing
  with `role "temuunair" does not exist` / `57P01` (D-7 env; reviewer cannot set
  `DATABASE_URL` under its permission rules). Zero FE-003-scoped failures.
- `pnpm gate` → attempted, fails before running: `WSL (11 - Relay) ERROR:
  CreateProcessCommon:817: execvpe(/bin/bash) failed` (no bash in this environment).
  `pnpm i18n:check`, lint, typecheck and `gh pr checks` are outside the reviewer's
  permission allow-list. **Disclosed, not silently skipped**: gate/CI status rests on the
  implementer's recorded tail and CI.

## Notes

- **Handoffs taken from `TMU-FE-003-security.md`**: (1) route drift → escalated to **B-1**
  above (the security review classified it MINOR M-5 "for the main reviewer"; given the
  shipped nav 404 and FE-01 being a merged contract, this review treats it as BLOCKER);
  (2) gate re-run — attempted, environment-blocked, disclosed above; (3) the red CI `audit`
  job is advisory (`continue-on-error`) and entirely pre-existing (`next-auth@5.0.0-beta.29`
  / `next-intl@3.26.5` — security M-6) with none of this task's three new deps in any
  advisory path → ops/BE follow-up task, **not** a finding against this diff; (4) FE-004
  must repeat the privacy check when text/hint fields join the draft; (5) hardening notes
  M-1…M-4 (per-browser draft key, `error.INTERNAL` fallback, `*.uploadUrl`/`*.thumbUrl`
  redaction, `labelKey` pattern) stand as filed — the reviewer re-checked M-4/M-2 and
  agrees they are hardening-only (server-controlled input today).
- **What is genuinely good**: D-1 is the right shape — mirrors built from contract enums
  (`schemas.ts:15`) with a runtime parity lock that loads the *real* contract through the
  established non-literal import hatch (`contract-parity.test.ts:16,36-38`), so drift breaks
  CI instead of drifting silently; FE-04 conformance is exact (`metaKey("categories")` +
  1 h staleTime `use-categories.ts:8,20,32`, retry policy network/5xx ×2 never 4xx,
  mutations `retry:false` — `lib/api/provider.tsx:9-15,23`); draft hygiene is solid
  (versioned envelope, closed schema, 24 h expiry, drop-on-any-mismatch —
  `draft.ts:64-74`); i18n has no literal UI strings in JSX (grep: literals exist only in
  the message files); D-7 env drift was diagnosed honestly rather than papered over; and
  the task file's observations O-1..O-3 are real contract gaps recorded instead of absorbed.
- **Undeclared gaps** are the recurring theme: `RATE_LIMITED` toast (n-3) and the
  leave-guard (n-4) are contract requirements that are neither implemented nor listed in
  Deferrals — add them so FE-004 inherits them deliberately.
- Review-cycle budget: 1 of max 2 used (`docs/05-workflow/05-definition-of-ready-done.md`).

## Verdict

**REQUEST_CHANGES** — the wizard itself is well built: tests-first with honest red
evidence, contract-parity locked, FE-04/FE-05 behaviour conformant, privacy and i18n
clean, lane-perfect, and a parallel security PASS. But it ships at the wrong URL
(**B-1**): `/report/new` instead of the merged contract's `/reports/new`, so the app's own
"Lapor" nav CTA 404s and the middleware gate misses the page — contract drift plus a
functional break with merged FE-002 code. Four FE-09 component rows are also unmet
(**M-1**); axe-green does not cover them. Fix B-1 (rename + task-file evidence) and M-1
(four small semantic/announcement changes), record n-3/n-4 as explicit deferrals, and
re-request review on cycle 2. The nine MINORs may be filed as follow-ups where noted; none
on its own would block.
