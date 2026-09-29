---
id: FE-08
title: i18n keys
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-I18N", "COPY", "BE-04"]
source_refs: ["Blueprint §5B.7", "DEC-008"]
---

# FE-08 — i18n keys

## Files and namespaces

| File | Role |
|---|---|
| `apps/web/src/i18n/messages/id.json` | source of truth (Bahasa Indonesia) |
| `apps/web/src/i18n/messages/en.json` | mirror (English) |

Namespaces (top-level keys): `common`, `landing`, `auth`, `home`, `browse`, `report`, `matches`,
`claim`, `chat`, `notifications`, `settings`, `admin`, `help`, `legal`, `error`, `category`,
`notification`, `match`, `sensitive`, `empty`.

## Key naming scheme

```
<area>.<screen>.<element>[.<variant>]
```

Examples:

| Key | Use |
|---|---|
| `report.wizard.step.category.title` | wizard step heading |
| `claim.room.handover.confirm` | button label |
| `error.CONFLICT_STATE` | error code message (required for every code in `BE-04`) |
| `notification.MATCH_SUGGESTED.title` | notification title (required for every `NotificationType`) |
| `match.reason.IMAGE_SIMILAR` | match reason chip |
| `category.PHONE` | category label |
| `match.band.STRONG` | band label |

## Rules

1. No string concatenation in code; use full keys with ICU placeholders (`{name}`, `{count}`).
2. ICU plurals: `{count, plural, =0 {…} other {…}}` — never `s`-suffix hacks.
3. Every key exists in **both** locales with identical placeholder sets.
4. API responses carry keys (`labelKey`, `error.code`), never translated sentences.
5. Dates/times via `Intl` with `timeZone: "Asia/Jakarta"`.
6. Enum values are never used as display text; map through `category.*`, `match.band.*`, etc.

## CI enforcement (`pnpm i18n:check`)

| Check | Fails when |
|---|---|
| Key parity | a key exists in one locale only |
| Unused keys | a key is never referenced (heuristic AST scan of `t("…")` calls) |
| Missing error keys | any `BE-04` code lacks `error.<code>` |
| Missing notification keys | any `BE-08` type lacks `notification.<TYPE>.title` and `.body` |
| Placeholder parity | ICU placeholders differ between locales |
| Literal UI strings | JSX text literals outside allowed list (brand names) |

## Adding keys (skill `add-i18n-keys`)

1. Add to `id.json` first (source), then mirror in `en.json`.
2. Reference via `t("…")` — never inline.
3. If the key maps to a server value, add it to `docs/02-design/09-content-and-microcopy.md`.
4. Run `pnpm i18n:check` and a component test rendering the new string.

## Locale switching

- `LocaleSwitcher` calls `PATCH /me` (persisted) and re-renders via `next-intl`; signed-out users
  get a cookie fallback.
- Switching does not lose form state; the wizard draft is locale-independent (ids only).

## Testing

- Component tests assert text comes from messages (mock `t` or use the real provider).
- E2E-15 switches id↔en and verifies persistence across navigation and reload.
- Email templates snapshot-tested per locale (`NOTIF-TEMPLATES`).
