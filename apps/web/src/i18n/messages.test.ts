import { describe, expect, it } from "vitest";

import id from "./messages/id.json";
import en from "./messages/en.json";

// BE-04 error catalog — every code needs `error.<code>` in both locales (FE-08 §CI).
const BE04_ERROR_CODES = [
  "AUTH_REQUIRED",
  "AUTH_DOMAIN_NOT_ALLOWED",
  "ACCOUNT_SUSPENDED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_FAILED",
  "CONFLICT_STATE",
  "IDEMPOTENCY_CONFLICT",
  "CLAIM_ALREADY_ACTIVE",
  "CLAIM_LIMIT_EXCEEDED",
  "REPORT_NOT_CLAIMABLE",
  "SELF_CLAIM_NOT_ALLOWED",
  "UPLOAD_INVALID_TYPE",
  "UPLOAD_TOO_LARGE",
  "UPLOAD_LIMIT_REACHED",
  "RATE_LIMITED",
  "ML_UNAVAILABLE",
  "INTERNAL",
] as const;

// BE-08 NotificationType — every type needs `notification.<TYPE>.title|body` in both locales.
const BE08_NOTIFICATION_TYPES = [
  "MATCH_SUGGESTED",
  "MATCH_INVITE",
  "CLAIM_SUBMITTED",
  "CLAIM_APPROVED",
  "CLAIM_REJECTED",
  "CLAIM_REMINDER",
  "MESSAGE_RECEIVED",
  "HANDOVER_PLANNED",
  "HANDOVER_CONFIRMED",
  "REPORT_RETURNED",
  "REPORT_EXPIRING",
  "REPORT_EXPIRED",
  "REPORT_REMOVED",
  "REPORT_APPROVED",
  "ADMIN_DISPUTE",
] as const;

function flatten(tree: unknown, prefix = ""): string[] {
  if (typeof tree !== "object" || tree === null) {
    return prefix.length > 0 ? [prefix] : [];
  }
  return Object.entries(tree).flatMap(([key, value]) => flatten(value, `${prefix}${key}.`));
}

function leafValue(tree: unknown, dottedKey: string): string | undefined {
  let node: unknown = tree;
  for (const part of dottedKey.split(".")) {
    if (typeof node !== "object" || node === null) {
      return undefined;
    }
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

function placeholders(message: string): string[] {
  const names = [...message.matchAll(/\{([a-zA-Z0-9_]+)/g)].map((match) => match[1] ?? "");
  return [...new Set(names)].sort();
}

describe("i18n messages", () => {
  it("reads both locale files with identical key sets", () => {
    const idKeys = flatten(id).sort();
    const enKeys = flatten(en).sort();

    expect(idKeys).toEqual(enKeys);
  });

  it("contains every BE-04 error code key in both locales", () => {
    const missing: string[] = [];

    for (const code of BE04_ERROR_CODES) {
      for (const [locale, messages] of [
        ["id", id],
        ["en", en],
      ] as const) {
        const value = leafValue(messages, `error.${code}`);
        if (typeof value !== "string" || value.trim().length === 0) {
          missing.push(`${locale}:error.${code}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("contains title and body keys for every BE-08 notification type in both locales", () => {
    const missing: string[] = [];

    for (const type of BE08_NOTIFICATION_TYPES) {
      for (const suffix of ["title", "body"] as const) {
        for (const [locale, messages] of [
          ["id", id],
          ["en", en],
        ] as const) {
          const value = leafValue(messages, `notification.${type}.${suffix}`);
          if (typeof value !== "string" || value.trim().length === 0) {
            missing.push(`${locale}:notification.${type}.${suffix}`);
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("uses identical ICU placeholders in both locales", () => {
    const mismatches: string[] = [];

    for (const key of flatten(id).sort()) {
      const idValue = leafValue(id, key);
      const enValue = leafValue(en, key);
      if (idValue === undefined || enValue === undefined) {
        continue;
      }

      const idPlaceholders = placeholders(idValue);
      const enPlaceholders = placeholders(enValue);
      if (idPlaceholders.join(",") !== enPlaceholders.join(",")) {
        mismatches.push(
          `${key}: id=[${idPlaceholders.join(",")}] en=[${enPlaceholders.join(",")}]`,
        );
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("keeps Indonesian as the source locale", () => {
    expect(leafValue(id, "app.tagline")).toBe("Hilang hari ini, ketemu bersama");
    expect(leafValue(id, "landing.cta.login")).toBe("Masuk dengan akun UNAIR");
    expect(leafValue(id, "error.NOT_FOUND")).toBe("Tidak ditemukan.");
    expect(leafValue(en, "app.tagline")).toBe("Lost Today, Found Together");
  });
});
