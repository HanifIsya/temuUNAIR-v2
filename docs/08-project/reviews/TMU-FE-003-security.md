---
id: TMU-FE-003-security
reviewer: security-reviewer
verdict: PASS
cycle: 1
date: 2026-10-05
---

# Security review — TMU-FE-003 (DoD #11)

**Scope**: `git diff 9df6156..a29ffaa` (33 files, working tree clean at `a29ffaa`) on
`agent/fe/TMU-FE-003-fe-wizard-photos`. Audited against
`docs/03-architecture/14-security-threat-model.md` (TB-1/TB-2/TB-3),
`docs/03-architecture/15-privacy-and-data-retention.md`,
`docs/03-architecture/09-storage-and-media-pipeline.md` and
`docs/04-contracts/backend/BE-10-storage-contract.md` (+ BE-01/04/09/12, FE-04/05/11).
Read-only for product code; this file is the only artefact written.

## Findings

| # | Item | Result | Note |
|---|---|---|---|
| 1 | Upload handshake client (presign → PUT → complete), credential exposure, presigned-URL hygiene, `thumbUrl` | PASS | The presigned PUT URL exists only as a local parameter/variable (`hooks/use-upload.ts:53-73`, `:103`) — never logged (the diff contains **no** log call at all), never placed in React state, never written to storage. `thumbUrl` comes from the API-UPL-02/03 `UploadState` response (`use-upload.ts:131`; BE-10 §`UploadState`: "signed URL when READY", 5-min GET TTL) and lives in client component state for rendering `<img src>` (`photo-uploader.tsx:97-105`). It is **not** persisted: the only `localStorage` writer in the diff is `draft.ts:34`, which stores `type/category/imageIds` only (`report-wizard.tsx:53`) — exactly what FE-04 L109 sanctions ("only uploadIds and text fields"). No credential/token beyond the short-lived presigned URL reaches the browser; session stays an httpOnly cookie (BE-09). Restored drafts deliberately show no thumb (`use-upload.ts:222` `thumbUrl: null`). |
| 2 | Client limits vs server authority (MIME / 8 MB / 5 photos) | PASS | `use-upload.ts:5-8` states "Client-side mirror of the BE-10 limits; the server stays authoritative", and the code matches: `localRejection` (`:47-51`) and the `max` cap (`:148-153`) are UX gates only. No test, i18n string or comment claims security from client validation; server re-validates MIME + magic bytes + size + count + EXIF (BE-10 L18-28, L26-30; TMU-BE-004 DoD-5). |
| 3 | `localStorage` drafts — contents, key namespacing, versioning | PASS (MINOR M-1) | `draft.ts` writes a fixed envelope `{version: 1, savedAt, data}` under two hard-coded keys `tu.draft.report.lost` / `.found` (`:19-21`) — keys are literals, never built from parsed input, so no cross-key injection. Load path: `JSON.parse` → object check → `version` check → `draftDataSchema.safeParse` → 24 h age check, each failure dropping the key (`:57-74`); the schema (`schemas.ts:28-32` = `ReportCreate.pick({type, category, imageIds})`, UUID-validated) is a plain `z.object`, so unknown/`__proto__` keys are stripped (no prototype-pollution gadget; `JSON.parse` own `__proto__` properties are inert anyway). Payload holds **no** tokens, emails, hint answers/`answer_enc`, embeddings, filenames or object URLs — grep confirms `draft.ts` is the sole storage writer in `apps/web/src`. MINOR M-1: the key is per-browser, not per-user, and nothing clears drafts on logout — on a shared device user B can read user A's type/category/image-UUIDs for ≤ 24 h (low sensitivity; contract-sanctioned key shape). |
| 4 | Error handling — no raw server messages/stack traces | PASS (MINOR M-2) | `photo-uploader.tsx:31-36` maps `OFFLINE` → `common.offline`, otherwise `t(\`error.${code}\`)`; `category-picker.tsx:44-47` shows `common.unknownError` + retry. Neither `error.message`, `details`, nor any stack/`requestId` is rendered (FE-11 L14 satisfied; grep for `dangerouslySetInnerHTML\|innerHTML\|eval\|__html` in the diff → none). Every BE-04 code reachable from API-UPL-01/02 (`UPLOAD_INVALID_TYPE`, `UPLOAD_TOO_LARGE`, `UPLOAD_LIMIT_REACHED`, `RATE_LIMITED`, `NOT_FOUND`, `FORBIDDEN`, `VALIDATION_FAILED`, `CONFLICT_STATE`, `IDEMPOTENCY_CONFLICT`, `INTERNAL`) exists as `error.<code>` in **both** locales (`en.json:87-106`). MINOR M-2: an uncatalogued future code would render the raw key path (`error.X`) — fall back to `error.INTERNAL`. |
| 5 | Logging — `console.*` and PII | PASS (MINOR M-3) | `rg 'console\.'` over `apps/web/src` → **no matches** in the new (or any) app code; `no-console: "error"` is enforced (`packages/config/eslint.config.mjs:53`). The diff adds no log statement of any kind, so there is no PII/vector-URL logging surface. Server-side pino redaction (pre-existing, `server/logging.ts:12-22`: cookie, authorization, `*.email`, `*.answer`, `*.answer_enc`, `*.body`, `*.imageUrl`, `*.token`, `*.password`) covers the privacy contract, but not `*.uploadUrl`/`*.thumbUrl` — MINOR M-3 (pre-existing gap, ops follow-up; nothing in this diff logs them). |
| 6 | Dependency advisories — CI `audit` job FAILED | FAIL (advisory) — **pre-existing, not introduced by this diff** (see "Dependency audit" below) | `pnpm audit --prod --audit-level=high` (the CI command, root `package.json:30`) → **11 findings: 3 critical, 2 high, 6 moderate**; full `pnpm audit` → 14 (3 critical / 2 high / 9 moderate). 100 % of paths trace to `apps/web>next-auth@5.0.0-beta.29` (+ its `@auth/core`), `apps/web>next-intl@3.26.5` and dev-only `drizzle-kit>esbuild`, `testcontainers>dockerode>uuid`, `vitest>@vitest/mocker` — **none** of the three new deps appears in any advisory path. Job is `continue-on-error: true` (ci.yml:171), so it does not block the PR. |
| 7 | Secrets in the diff / history | PASS | `gitleaks git --log-opts="9df6156..a29ffaa"` → **no leaks found** (1 commit, ~96 KB). The only credential-shaped string added is the task-file D-7 dev Docker URL `postgresql://temuunair:temuunair@localhost:5432/temuunair`; `.env.example:9` = `postgres://temuunair:temuunair@localhost:5432/temuunair` — identical dev credentials/host/port/db, differing only in the `postgres://` vs `postgresql://` scheme prefix → **accepted** (documented docker-compose default, not a secret). No `.env`, keys, `X-Amz-*`, JWTs or credentialed URLs anywhere in the 33 files. |
| 8 | Authz / IDOR on the routes this task touches | PASS (note → main reviewer) | No server route is added. The client calls only API-UPL-01/02 (owner-checked server-side: TMU-BE-004 DoD-4 "foreign upload → 404 `NOT_FOUND`"), API-META-01, and the storage PUT on a server-issued URL; every id it sends is server-issued. `rehydrate(draft.imageIds)` trusts `localStorage`, but report create re-validates ownership/READY/linked server-side (`server/handlers/reports.test.ts:408-426`: foreign, non-READY and already-linked uploads are rejected), so a tampered draft cannot attach someone else's object. Page authz: `app/(app)/report/new` runs `AppLayout` → `getAppUser()` → `redirect("/login")` (`(app)/layout.tsx:8-12`, tested at `layout.test.tsx:52`). **Note (M-5)**: the page lives at `/report/new`, while FE-01 L22 and the shell nav (`features/shell/nav-items.ts:18,35`) say `/reports/new`; the middleware cheap gate `APP_AUTH_MATCHER` (`features/shell/guard.ts:6`) lists only `/reports`, so the implemented path misses that (defence-in-depth) layer — the authoritative layout check still applies, so this is not an authz hole, but it is contract/functional drift for the main reviewer. |
| 9 | Rate limits / abuse amplification | PASS | No automatic retry storm: mutations run with `retry: false` (`lib/api/provider.tsx:23`), queries retry only network/5xx ×2 (`:9-15`), and upload failures surface a **manual** retry that reuses the same `Idempotency-Key` (`use-upload.ts:192-209`, asserted in `use-upload.test.tsx:153-179`). Client caps 5 photos / batch; the server owns 30 uploads/hour/user + `RATE_LIMITED` (BE-12 L19, BE-10 L30) with the `error.RATE_LIMITED` key present. |
| 10 | Upload validation & EXIF (server authority) | PASS (unchanged by this diff) | The FE uploads original bytes and makes no claim of client-side sanitisation; EXIF/GPS strip, magic-byte and size checks, thumb/masked generation stay server-side (BE-10 L18-19; TMU-BE-004 DoD-5). UI copy only promises server-side masking for sensitive categories (`sensitive.notice.*`), consistent with ARCH-MEDIA. |
| 11 | SSRF in ML image fetch | PASS (no surface in this diff) | The FE never fetches a caller-supplied URL: outbound targets are the server-issued presigned PUT (storage host) and `img src={thumbUrl}` returned by our own API. Worker/ML allowlist + redirect rejection (TB-3, `06-ml-service-design.md` L78) is untouched by this diff. |
| 12 | Hint-answer confidentiality | PASS (not yet in scope) | Steps "hints"/"custody" are deferred to TMU-FE-004; the draft schema cannot hold them (closed `z.object` with three keys). `hintPrompts` (`schemas.ts:39`) is public question copy from API-META-01, never persisted, and answers never reach this code path. **FE-004 must repeat this check** — FE-04 L109 allows "text fields" in the draft, and hint *answers* must never enter `localStorage`. |

## Findings by severity

- **BLOCKER** — none.
- **MAJOR (pre-existing, outside this diff, does not block TMU-FE-003)** — **M-6**: 3 critical + 2 high production advisories in `next-auth@5.0.0-beta.29` → `@auth/core` (GHSA-8fpg-xm3f-6cx3 fail-open auth checks, GHSA-7rqj-j65f-68wh homoglyph `@` bypass, GHSA-xmf8-cvqr-rfgj `getToken()` crash), plus `next-intl@3.26.5` open-redirect/prototype-pollution moderates. Exact-pinned `next-auth` and major-pinned `next-intl` require an ops/BE task (and an ADR for the next-intl v3→v4 jump) — not a frontend-wizard change.
- **MINOR** — M-1 draft key is per-browser (not per-user) and survives logout (≤ 24 h, type/category/image-UUIDs only); M-2 no `error.INTERNAL` fallback for an uncatalogued server code; M-3 pino redaction list lacks `*.uploadUrl`/`*.thumbUrl`; M-4 `categoryMetaSchema.labelKey` (`schemas.ts:36`) accepts any string and is passed straight to `t()` (`category-picker.tsx:73`) — constrain it to `/^category\.[A-Z_]+$/` or derive it from `value` (server-controlled input today, so hardening only); M-5 `/report/new` vs FE-01 `/reports/new` path drift + middleware cheap-gate miss (see row 8).

## Dependency audit (item 6 — command, result, provenance)

- **Command**: root `package.json` has `"audit": "pnpm audit --prod --audit-level=high"`; CI runs `pnpm -s run audit` (ci.yml:178) with `continue-on-error: true` (ci.yml:171). Run locally at `a29ffaa` (tree clean).
- **Result (CI command)**: 11 vulnerabilities — **3 critical, 2 high, 6 moderate** → non-zero exit (the observed red job). **Result (full `pnpm audit`)**: 14 — 3 critical / 2 high / 9 moderate.
- **Provenance**: every `Paths` entry is one of
  `apps__web>next-auth` (5), `apps__web>next-auth>@auth/core` (3) — specifiers
  `next-auth: 5.0.0-beta.29` (exact) and `next-intl: ^3.26.5` in `apps/web/package.json`,
  both **untouched** by this diff (the package.json hunk adds only
  `@hookform/resolvers ^5.9.1`, `@tanstack/react-query ^5.104.1`, `react-hook-form ^7.89.0`);
  `apps__web>next-intl` (2); and dev-only `packages__db>drizzle-kit>…>esbuild`,
  `tests__integration>testcontainers>dockerode>uuid`, `.>vitest`, `.>vitest>@vitest/mocker`.
  The three new deps' subtrees are clean: `react-hook-form@7.89.0` (no runtime deps),
  `@hookform/resolvers@5.9.1` (peers only), `@tanstack/react-query@5.104.1 → @tanstack/query-core@5.104.1`
  (pnpm-lock.yaml:59-64, 1016, 4371, 4858-4862) — none is in any advisory path.
- **Conclusion**: the advisories are **pre-existing at `9df6156`** (version-based, not
  introduced by this change; the packages, specifiers and resolved versions are unchanged by
  the diff). A lockfile-at-`9df6156` re-run was not possible under the read-only/no-stash
  constraint, so provenance rests on the advisory `Paths` + the package.json diff + the
  lockfile importers above — all three agree.

## Verdict

**PASS** — DoD #11 satisfied for TMU-FE-003. The upload handshake hands the browser only a
short-lived, server-scoped presigned PUT (never logged, never persisted), `thumbUrl` is a
signed GET kept in memory only, drafts carry report fields alone inside a versioned,
schema-validated, 24 h envelope under fixed per-type keys, errors are rendered exclusively via
`error.<code>`/`common.*` keys in both locales, and the new app code contains zero `console.*`
or log calls. No BLOCKER or MAJOR finding is attributable to this diff: the red CI `audit`
job is advisory and entirely pre-existing (`next-auth`/`next-intl`/dev-tooling paths — see
provenance above), and gitleaks over `9df6156..a29ffaa` is clean, with the task file's
`postgresql://temuunair:temuunair@localhost:5432/temuunair` matching the accepted
`.env.example` dev value. Five MINOR hardening notes (M-1…M-5) plus the pre-existing M-6
advisory carry-over are recorded for follow-up tasks; none blocks this task.

## For the main reviewer to double-check

1. **Route drift (M-5)**: page implemented at `/report/new` while FE-01 L22 / nav links say
   `/reports/new` — decide whether this needs a `TMU-CTR-*`/rename before FE-004, and note the
   nav currently points at a non-existent path (functional, not security).
2. Run `pnpm gate` yourself (this review ran only read-only checks + `pnpm audit` + gitleaks).
3. Confirm the red `audit` CI job is accepted as advisory and file the ops/BE follow-up for
   `next-auth ≥ 5.0.0-beta.32` (M-6); consider `next-intl ≥ 4.9.2` separately.
4. FE-004: repeat this review when text/hint fields join the draft (hint answers must never
   reach `localStorage`), and when the submit path calls API-REP-01.
5. Optional hardening tickets: M-1 (user-scope or logout-clear drafts), M-2 (unknown error-code
   fallback), M-3 (`*.uploadUrl`/`*.thumbUrl` in `REDACTION_PATHS`), M-4 (`labelKey` pattern).
