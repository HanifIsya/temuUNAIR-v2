---
id: ARCH-I18N
title: Internationalisation design
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["NFR", "FE-08", "DEC-008"]
source_refs: ["NFR-050..052", "DEC-008"]
---

# Internationalisation design

Default locale **`id` (Bahasa Indonesia)**; secondary **`en`** (DEC-008). i18n exists from day
one — retrofitting is not allowed.

## Locale resolution

1. Signed-in user: `users.locale` (set via `PATCH /me` or the switcher).
2. Signed-out: `NEXT_LOCALE` cookie if present, else `Accept-Language` match, else `id`.
3. No locale path prefixes in MVP (`/home` renders in the active locale); `next-intl` supports
   a future `/en/...` migration without changing components.

## Message files

- `apps/web/src/i18n/messages/id.json` (source of truth for copy) and `en.json` (mirror).
- Namespaces: `common`, `landing`, `auth`, `home`, `browse`, `report`, `matches`, `claim`,
  `chat`, `notifications`, `settings`, `admin`, `help`, `legal`, `error`.
- Key scheme: `<area>.<screen>.<element>[.<variant>]` — e.g.
  `report.wizard.step.category.title`, `claim.room.handover.confirm`, `error.CONFLICT_STATE`.
- ICU message format; plurals via `{count, plural, ...}`; no string concatenation in code.

## Server-side rules

- API responses carry **i18n keys** (`labelKey`, `error.code`) and never translated sentences,
  except `error.message` (developer-oriented, English).
- Dates/times: ISO-8601 with offset on the wire; the UI renders `Asia/Jakarta` (WIB) via `Intl`.
- Enums are stable English codes; the UI maps them through messages.

## Formatting rules

| Data | Rule |
|---|---|
| Dates | `id`: `29 Sep 2026`; `en`: `29 Sep 2026`; relative times via `Intl.RelativeTimeFormat` |
| Times | 24-hour, `HH.mm` in `id`, `HH:mm` in `en`, always WIB with label "WIB" |
| Numbers | `Intl.NumberFormat` with locale; percentages only in admin |
| Currency | none in MVP |
| Names | display as first name + initial (privacy), never reversed |

## CI enforcement (`i18n:check`)

1. `id.json` and `en.json` have identical key sets (missing/unused keys fail).
2. Every error code in §5A.14 has an `error.<code>` key in both locales.
3. Every `NotificationType` has title/body keys in both locales.
4. No raw user-facing string literals in components (ESLint rule on JSX text).

## Copy ownership

- Bahasa Indonesia copy is the source (written in `docs/02-design/09-content-and-microcopy.md`);
  English is a mirror that must stay semantically equal.
- Tone rules (`09-content-and-microcopy.md`) apply to both; Indonesian uses "kamu".

## Testing

- Component tests assert rendered strings come from messages (no literals).
- E2E-15: switch id↔en and confirm persistence across reload and pages.
- Snapshot tests for emails per locale.

## Open items

- `OPEN`: whether a third language (Javanese?) is ever in scope — currently no.
- `OPEN`: whether the English copy needs native review before launch.
