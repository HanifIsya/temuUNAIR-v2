---
id: FE-11
title: Error handling UX
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["BE-04", "FE-04", "COPY"]
source_refs: ["Blueprint §5B.4, §5B.6"]
---

# FE-11 — Error handling UX

Every error `code` from `BE-04` maps to a user-visible behaviour. The message always comes from
`error.<code>` in i18n (id/en); the UI never shows the raw `error.message` except in dev tools.

| Code | UI behaviour | Where | Retry |
|---|---|---|---|
| `AUTH_REQUIRED` | redirect `/login?next=<current>` | global | after login |
| `AUTH_DOMAIN_NOT_ALLOWED` | `/auth/error` page with "Gunakan akun UNAIR kamu" + link to try another account | auth | manual |
| `ACCOUNT_SUSPENDED` | full-page notice with admin contact; all actions disabled | global | none |
| `FORBIDDEN` | `/403` page (or inline forbidden panel in drawers) | page-level | back home |
| `NOT_FOUND` | `/404` page (also for hidden resources) or inline "sudah tidak tersedia" toast in mutations | page/mutation | back |
| `VALIDATION_FAILED` | field errors via `details.fields[]`; unknown paths → form-level alert with requestId | forms | fix & resubmit |
| `CONFLICT_STATE` | toast "Data sudah berubah. Muat ulang ya." + automatic refetch of the affected query | mutations | automatic |
| `IDEMPOTENCY_CONFLICT` | toast "Permintaan berbeda dengan sebelumnya" + refresh action | submit retries | manual |
| `CLAIM_ALREADY_ACTIVE` | inline alert on the challenge form with a link to the existing claim | claim new | — |
| `CLAIM_LIMIT_EXCEEDED` | inline alert with remaining-attempts context and "coba besok" | claim new | — |
| `REPORT_NOT_CLAIMABLE` | inline alert + link back to the report; hides the claim CTA | report detail | — |
| `SELF_CLAIM_NOT_ALLOWED` | inline alert; claim CTA is already hidden for owners (defensive) | report detail | — |
| `UPLOAD_INVALID_TYPE` | per-file error in `PhotoUploader` with the file name | wizard | choose another |
| `UPLOAD_TOO_LARGE` | per-file error "maks 8 MB" | wizard | choose smaller |
| `UPLOAD_LIMIT_REACHED` | uploader shows "maksimal 5 foto" and disables adding | wizard | remove one |
| `RATE_LIMITED` | toast with countdown from `Retry-After`; action re-enables when it expires | any | automatic |
| `ML_UNAVAILABLE` | informational banner "Pencocokan sedang sibuk. Kami coba lagi nanti." — never blocks the user | matching surfaces | automatic |
| `INTERNAL` | `ErrorState` with copyable requestId + retry | any | manual |

## Shared behaviours

1. `ErrorState` always shows: what happened (plain language), retry button, copyable `requestId`
   for 5xx.
2. Toasts for mutations; pages for load failures; inline for field/domain errors.
3. `409 CONFLICT_STATE` always refetches before telling the user anything.
4. `429` shows the remaining seconds; the button stays disabled until the window passes.
5. Errors are announced for screen readers (`role="alert"`), and focus moves to the alert for
   form-level failures.
6. Network errors show the offline pattern (`/offline` or inline banner) and never a fake
   success.

## Mapping implementation

```ts
// apps/web/src/lib/api/errors.ts
export function toUserFacing(error: ApiError): { key: string; action: "retry"|"login"|"reload"|"none" } {
  switch (error.code) {
    case "AUTH_REQUIRED": return { key: "error.AUTH_REQUIRED", action: "login" };
    case "CONFLICT_STATE": return { key: "error.CONFLICT_STATE", action: "reload" };
    case "RATE_LIMITED": return { key: "error.RATE_LIMITED", action: "retry" };
    default: return { key: `error.${error.code}`, action: "none" };
  }
}
```

## Testing

- Unit: every code in `BE-04` has a mapping and an i18n key (CI check).
- Component: `ErrorState` renders requestId; form error mapping test per form.
- E2E: `429` toast, `409` refetch path, `/404` for a hidden report, `/403` for non-staff admin.
