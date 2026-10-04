// apps/web/src/server/validation.ts
// Zod → BE-04 VALIDATION_FAILED translation (BE-01 §validation).

import type { z } from "zod";
import { DomainError, ErrorCode } from "./errors";

/**
 * Convert a ZodError into a DomainError carrying per-field i18n keys,
 * e.g. path ["mutedTypes", 0] → key "error.VALIDATION_FAILED.mutedTypes.0".
 */
export function zodToValidationFailed(error: z.ZodError): DomainError {
  const fields = error.issues.map((issue) => {
    const path = issue.path.join(".");
    return { path, key: `error.VALIDATION_FAILED.${path}` };
  });
  return new DomainError(ErrorCode.VALIDATION_FAILED, "Request validation failed", { fields });
}
