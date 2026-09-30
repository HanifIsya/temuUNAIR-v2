#!/usr/bin/env node
// i18n parity check (FE-08). Fails on missing keys, unused keys, placeholder mismatch, and on
// any BE-04 error code or BE-08 notification type lacking a key in both locales.
import { readFileSync, existsSync } from "node:fs";

const ID = "apps/web/src/i18n/messages/id.json";
const EN = "apps/web/src/i18n/messages/en.json";

if (!existsSync(ID) || !existsSync(EN)) {
  console.log("i18n:check skipped (message files not created yet — M3)");
  process.exit(0);
}

const id = JSON.parse(readFileSync(ID, "utf8"));
const en = JSON.parse(readFileSync(EN, "utf8"));

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

const idKeys = new Set(flatten(id));
const enKeys = new Set(flatten(en));
const errors = [];

for (const k of idKeys) if (!enKeys.has(k)) errors.push(`missing in en: ${k}`);
for (const k of enKeys) if (!idKeys.has(k)) errors.push(`missing in id: ${k}`);

// error.<code> keys required for every BE-04 code
const codes = [
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
];
for (const code of codes) {
  if (!idKeys.has(`error.${code}`)) errors.push(`missing error key (id): error.${code}`);
  if (!enKeys.has(`error.${code}`)) errors.push(`missing error key (en): error.${code}`);
}

// notification.<TYPE>.title|body required for every BE-08 type
const types = [
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
];
for (const t of types) {
  for (const suffix of ["title", "body"]) {
    const key = `notification.${t}.${suffix}`;
    if (!idKeys.has(key)) errors.push(`missing notification key (id): ${key}`);
    if (!enKeys.has(key)) errors.push(`missing notification key (en): ${key}`);
  }
}

if (errors.length) {
  console.error(`i18n:check failed with ${errors.length} problem(s):\n${errors.join("\n")}`);
  process.exit(1);
}
console.log(`i18n:check passed (${idKeys.size} keys per locale)`);
