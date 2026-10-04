// apps/worker/src/logging.ts
// Structured pino logger for job handlers with the privacy redaction list
// (hint answers, emails, tokens and image URLs must never reach logs).

import pino from "pino";

/**
 * Redaction paths per the privacy contract. Flat paths cover top-level job
 * fields, `*.x` paths cover nested payloads, plus the auth header.
 */
export const WORKER_REDACTION_PATHS: string[] = [
  "req.headers.authorization",
  "email",
  "answer",
  "answer_enc",
  "token",
  "imageUrl",
  "text",
  "title",
  "description",
  "*.email",
  "*.answer",
  "*.answer_enc",
  "*.token",
  "*.imageUrl",
  "*.text",
  "*.title",
  "*.description",
];

export interface WorkerLogger {
  info(record: Record<string, unknown>): void;
  warn(record: Record<string, unknown>): void;
  error(record: Record<string, unknown>): void;
}

export interface CreateWorkerLoggerOptions {
  level?: string;
  stream?: { write(chunk: string): void };
}

export function createWorkerLogger(options: CreateWorkerLoggerOptions = {}): WorkerLogger {
  const pinoLogger = pino(
    {
      level: options.level ?? "info",
      redact: { paths: WORKER_REDACTION_PATHS, censor: "[redacted]" },
    },
    options.stream,
  );
  return {
    info: (record) => {
      pinoLogger.info(record);
    },
    warn: (record) => {
      pinoLogger.warn(record);
    },
    error: (record) => {
      pinoLogger.error(record);
    },
  };
}

/**
 * Strips URLs and numeric-array payloads (embeddings, pgvector literals) from
 * free-text error messages and caps the length before they reach logs.
 */
export function scrubMessage(message: string): string {
  return message
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/\{"[^"]*"(?:,"[^"]*")*}/g, "[array]")
    .replace(
      /\[-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(?:,\s*-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)+]/g,
      "[vector]",
    )
    .slice(0, 300);
}
