---
name: add-i18n-keys
description: Adding UI strings (id + en) and error/notification keys correctly. Use for any user-facing text.
---

1. Add the key to `apps/web/src/i18n/messages/id.json` **first** (source of truth), following the
   scheme `<area>.<screen>.<element>[.<variant>]`.
2. Mirror it in `en.json` with the same ICU placeholders.
3. Required key families:
   - `error.<code>` for every code in `BE-04`;
   - `notification.<TYPE>.title|body` for every type in `BE-08`;
   - `match.reason.<CODE>`, `match.band.<BAND>`, `category.<CATEGORY>`.
4. Rules:
   - no string concatenation; full keys with ICU placeholders (`{name}`, `{count, plural, …}`);
   - dates/times via `Intl` with `timeZone: "Asia/Jakarta"`;
   - status is never colour-only — pair it with text;
   - tone: warm, plain Bahasa Indonesia, address as "kamu".
5. Update `docs/02-design/09-content-and-microcopy.md` with the new copy.
6. Run `pnpm i18n:check` (parity, unused, missing error/notification keys, placeholder parity).
7. Add/adjust a component test asserting the string renders from the key.
