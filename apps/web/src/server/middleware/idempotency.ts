// apps/web/src/server/middleware/idempotency.ts
// TMU-BE-008: BE-01 idempotency middleware shared by the idempotent POSTs —
// JSON body reading, required `Idempotency-Key`, sha256 fingerprint and the
// store-backed replay run (same key + body within 24 h returns the original
// result; a different fingerprint is IDEMPOTENCY_CONFLICT).

import { createHash } from "node:crypto";
import { DomainError, ErrorCode } from "../errors";
import { getIdempotencyStore, type IdempotencyOptions, type IdempotencyRun } from "../idempotency";

export interface JsonBody {
  text: string;
  raw: unknown;
}

export async function readJsonBody(request: Request): Promise<JsonBody> {
  const text = await request.text();
  try {
    return { text, raw: JSON.parse(text) as unknown };
  } catch {
    throw new DomainError(ErrorCode.VALIDATION_FAILED, "Body must be valid JSON", {
      fields: [],
    });
  }
}

export function requireIdempotencyKey(request: Request): string {
  const key = request.headers.get("idempotency-key")?.trim();
  if (!key) {
    throw new DomainError(ErrorCode.VALIDATION_FAILED, "Idempotency-Key header is required", {
      fields: [{ path: "Idempotency-Key", key: "error.VALIDATION_FAILED.Idempotency-Key" }],
    });
  }
  return key;
}

export function fingerprint(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function withIdempotency<T>(
  opts: IdempotencyOptions,
  fn: () => Promise<T>,
): Promise<IdempotencyRun<T>> {
  return getIdempotencyStore().run(opts, fn);
}
