// apps/web/src/server/logging.ts
// Pino logger with privacy redaction (15-privacy-and-data-retention.md) and
// requestId generation (BE-01 X-Request-Id).

import { randomBytes } from "node:crypto";
import pino from "pino";

/**
 * Redaction paths per 15-privacy-and-data-retention.md §Log redaction.
 * Exported so tests can verify the list matches the privacy contract.
 */
export const REDACTION_PATHS: string[] = [
  "req.headers.cookie",
  "req.headers.authorization",
  "*.email",
  "*.answer",
  "*.answer_enc",
  "*.body",
  "*.imageUrl",
  "*.token",
  "*.password",
];

/**
 * Default pino logger for the server. Log level is controlled by LOG_LEVEL env
 * var (defaults to "info"). In dev, pino-pretty is used for readable output.
 */
export const logger: pino.Logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: REDACTION_PATHS,
    censor: "[redacted]",
  },
  ...(process.env.NODE_ENV !== "production"
    ? { transport: { target: "pino-pretty", options: { colorize: true } } }
    : {}),
});

/**
 * Generate a unique request ID.
 * Format: `req_` + 16 random hex chars (8 bytes of entropy).
 * Accepts an incoming X-Request-Id or mints a new one (BE-01).
 */
export function generateRequestId(incoming?: string | null): string {
  if (incoming && /^req_[a-zA-Z0-9]+$/.test(incoming)) {
    return incoming;
  }
  return `req_${randomBytes(8).toString("hex")}`;
}
