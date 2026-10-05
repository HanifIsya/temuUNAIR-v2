// apps/web/src/server/errors.ts
// Domain error → BE-04 status/code mapping.
// Route handlers throw DomainError; the handler middleware maps to the envelope.

/**
 * All 18 error codes from BE-04. Stable; never renamed once shipped.
 */
export const ErrorCode = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  AUTH_DOMAIN_NOT_ALLOWED: "AUTH_DOMAIN_NOT_ALLOWED",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  CONFLICT_STATE: "CONFLICT_STATE",
  IDEMPOTENCY_CONFLICT: "IDEMPOTENCY_CONFLICT",
  CLAIM_ALREADY_ACTIVE: "CLAIM_ALREADY_ACTIVE",
  CLAIM_LIMIT_EXCEEDED: "CLAIM_LIMIT_EXCEEDED",
  REPORT_NOT_CLAIMABLE: "REPORT_NOT_CLAIMABLE",
  SELF_CLAIM_NOT_ALLOWED: "SELF_CLAIM_NOT_ALLOWED",
  UPLOAD_INVALID_TYPE: "UPLOAD_INVALID_TYPE",
  UPLOAD_TOO_LARGE: "UPLOAD_TOO_LARGE",
  UPLOAD_LIMIT_REACHED: "UPLOAD_LIMIT_REACHED",
  RATE_LIMITED: "RATE_LIMITED",
  ML_UNAVAILABLE: "ML_UNAVAILABLE",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/** BE-04 code → HTTP status mapping. */
const STATUS_MAP: Record<ErrorCodeType, number> = {
  AUTH_REQUIRED: 401,
  AUTH_DOMAIN_NOT_ALLOWED: 403,
  ACCOUNT_SUSPENDED: 403,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 422,
  CONFLICT_STATE: 409,
  IDEMPOTENCY_CONFLICT: 409,
  CLAIM_ALREADY_ACTIVE: 409,
  CLAIM_LIMIT_EXCEEDED: 429,
  REPORT_NOT_CLAIMABLE: 409,
  SELF_CLAIM_NOT_ALLOWED: 403,
  UPLOAD_INVALID_TYPE: 415,
  UPLOAD_TOO_LARGE: 413,
  UPLOAD_LIMIT_REACHED: 409,
  RATE_LIMITED: 429,
  ML_UNAVAILABLE: 503,
  INTERNAL: 500,
};

/** Return the HTTP status for a BE-04 error code. */
export function httpStatusForCode(code: ErrorCodeType): number {
  return STATUS_MAP[code];
}

/**
 * Typed domain error. Route handlers throw these; the handler middleware
 * catches and maps to the BE-01 error envelope.
 */
export class DomainError extends Error {
  readonly code: ErrorCodeType;
  readonly details: unknown;

  constructor(code: ErrorCodeType, message: string, details?: unknown) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }

  get httpStatus(): number {
    return httpStatusForCode(this.code);
  }
}

/** Error envelope shape per BE-01. */
export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
}

/**
 * Convert any error into a BE-01 error envelope.
 * - DomainError → uses its code, message, details.
 * - Unknown error → INTERNAL with generic message (no stack traces, BE-04 rule 4).
 */
export function toErrorResponse(err: unknown, requestId: string): ErrorEnvelope {
  if (err instanceof DomainError) {
    return {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
        requestId,
      },
    };
  }
  return {
    error: {
      code: ErrorCode.INTERNAL,
      message: "An unexpected error occurred",
      requestId,
    },
  };
}
