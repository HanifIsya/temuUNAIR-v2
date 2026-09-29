---
id: FE-05
title: Forms and validation
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["FE-03", "BE-04", "SCR-004"]
source_refs: ["Blueprint §5B.5"]
---

# FE-05 — Forms and validation

## Stack

- `react-hook-form` + `zodResolver` with schemas imported from `@temuunair/contracts`
  (step-level subsets of `ReportCreate`, `ClaimCreate`, etc.).
- Client validation is convenience only; the server is authoritative. A `422` always wins.
- Server `422` `details.fields[]` are mapped onto fields by `path`; unknown paths render in a
  form-level alert with the `requestId`.

## Wizard steps

**LOST** (`/reports/new?type=lost`)

| # | Step | Fields | Validation highlights |
|---|---|---|---|
| 1 | Kategori | `category` | required; shows `SensitiveNotice` when sensitive |
| 2 | Foto (opsional) | `imageIds` | 0–5 READY uploads |
| 3 | Detail | `title`, `description`, `colors`, `brand` | 3–80 / 10–1000 / ≤3 colors / ≤60 |
| 4 | Lokasi & waktu | `location`, `occurredAt` | campus required; `from ≤ now`; not older than 180 days |
| 5 | Tinjau | review + duplicate preview | submit with `Idempotency-Key` |

**FOUND** (`/reports/new?type=found`)

| # | Step | Fields | Validation highlights |
|---|---|---|---|
| 1 | Kategori | `category` | as above |
| 2 | Foto (**≥1**) | `imageIds` | at least 1 READY |
| 3 | Detail | as LOST | |
| 4 | Lokasi & waktu | as LOST | `occurredAt` point or window |
| 5 | Penitipan | `custody`, `dropPointId?` | `AT_DROP_POINT` requires a valid drop point |
| 6 | Pertanyaan verifikasi | `verificationHints[]` | ≥1 (≥2 if sensitive), prompt 5–140, answer 1–200 |
| 7 | Tinjau | review | submit |

## Claim form (`/claims/new`)

| Field | Rule |
|---|---|
| `answers[]` | 1–3 items, one per chosen hint, each 1–200 chars |
| `note` | ≤500 chars, optional |
| remaining attempts | shown from the last `CLAIM_LIMIT_EXCEEDED`/successful count response |

## Shared behaviours

1. Character counters on `title` (80), `description` (1000), `note` (500), hint answer (200).
2. Autosave the draft on step change (`FE-04`); restore on reload with a "draft dipulihkan" toast.
3. Double-submit prevention: submit button disables on first click and carries `aria-busy`.
4. `Idempotency-Key` is generated per submit attempt and **reused** on manual retry of the same
   payload.
5. Leave-guard when a draft exists (confirm dialog: "Simpan draft / Buang / Tetap di sini").
6. Success screen states what happens next + link to the created report.
7. Errors are announced: focus moves to the first invalid field; the summary alert links to it.

## Field-level error keys

The server returns i18n keys; the client maps them directly (`error.field.<field>.<rule>`), with
fallbacks to `error.VALIDATION_FAILED`. Client-only rules reuse the same key names so a field
never shows two different messages.

## Conditional rules (enforced both sides)

| Rule | Client | Server |
|---|---|---|
| FOUND: ≥1 image | blocks step 2 | re-checked in service |
| FOUND: custody required | blocks step 5 | CHECK constraint + service |
| FOUND: `AT_DROP_POINT` needs `dropPointId` | blocks step 5 | service |
| FOUND: ≥1 hint (≥2 sensitive) | blocks step 6 | service |
| LOST: hints/custody forbidden | not rendered | service rejects |
| `occurredAt.from ≤ now` | inline | service |
| LOST not older than 180 days | inline | service |
| Image ≤5 per report | uploader cap | service + DB |

## Testing

- Component tests per form: render every state, keyboard submit, error mapping (mocked `422`).
- Wizard navigation tests: canProceed per step, draft restore, leave-guard.
- E2E-02/03/06/10 cover the full wizards with `ML_MODE=stub`.
