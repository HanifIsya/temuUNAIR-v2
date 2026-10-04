// apps/web/src/server/idempotency.ts
// BE-01 idempotency: same key + same body within 24 h replays the original
// result; same key + different body is an IDEMPOTENCY_CONFLICT.
// In-memory, per-instance (no table exists for idempotency keys yet — noted
// in TMU-BE-004 task file as a single-instance limitation).

import { DomainError, ErrorCode } from "./errors";

export const IDEMPOTENCY_TTL_MS = 86_400_000;

export interface IdempotencyOptions {
  scope: string;
  subject: string;
  key: string;
  bodyHash: string;
}

export interface IdempotencyRun<T> {
  replayed: boolean;
  value: T;
}

export interface IdempotencyStore {
  run<T>(opts: IdempotencyOptions, fn: () => Promise<T>): Promise<IdempotencyRun<T>>;
}

interface Entry {
  bodyHash: string;
  value: unknown;
  storedAt: number;
}

export function createIdempotencyStore(
  opts: { now?: () => number; ttlMs?: number } = {},
): IdempotencyStore {
  const now = opts.now ?? Date.now;
  const ttlMs = opts.ttlMs ?? IDEMPOTENCY_TTL_MS;
  const entries = new Map<string, Entry>();

  return {
    async run<T>(o: IdempotencyOptions, fn: () => Promise<T>): Promise<IdempotencyRun<T>> {
      const cacheKey = `${o.scope}|${o.subject}|${o.key}`;
      const existing = entries.get(cacheKey);
      if (existing && now() - existing.storedAt <= ttlMs) {
        if (existing.bodyHash !== o.bodyHash) {
          throw new DomainError(
            ErrorCode.IDEMPOTENCY_CONFLICT,
            "Idempotency-Key was reused with a different body",
          );
        }
        return { replayed: true, value: existing.value as T };
      }
      const value = await fn();
      entries.set(cacheKey, { bodyHash: o.bodyHash, value, storedAt: now() });
      return { replayed: false, value };
    },
  };
}

let store: IdempotencyStore | null = null;

export function getIdempotencyStore(): IdempotencyStore {
  store ??= createIdempotencyStore();
  return store;
}
