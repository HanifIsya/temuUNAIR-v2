import { describe, expect, it } from "vitest";

// TMU-BE-001 (red evidence): errors.ts domain error → BE-04 status/code mapping.

describe("server errors (BE-04)", () => {
  it("exports all 18 BE-04 error codes", async () => {
    const { ErrorCode } = await import("./errors");
    const codes: string[] = [
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
      expect(ErrorCode).toHaveProperty(code);
    }
  });

  it("maps each code to the correct HTTP status per BE-04", async () => {
    const { httpStatusForCode, ErrorCode } = await import("./errors");
    expect(httpStatusForCode(ErrorCode.AUTH_REQUIRED)).toBe(401);
    expect(httpStatusForCode(ErrorCode.AUTH_DOMAIN_NOT_ALLOWED)).toBe(403);
    expect(httpStatusForCode(ErrorCode.ACCOUNT_SUSPENDED)).toBe(403);
    expect(httpStatusForCode(ErrorCode.FORBIDDEN)).toBe(403);
    expect(httpStatusForCode(ErrorCode.NOT_FOUND)).toBe(404);
    expect(httpStatusForCode(ErrorCode.VALIDATION_FAILED)).toBe(422);
    expect(httpStatusForCode(ErrorCode.CONFLICT_STATE)).toBe(409);
    expect(httpStatusForCode(ErrorCode.IDEMPOTENCY_CONFLICT)).toBe(409);
    expect(httpStatusForCode(ErrorCode.CLAIM_ALREADY_ACTIVE)).toBe(409);
    expect(httpStatusForCode(ErrorCode.CLAIM_LIMIT_EXCEEDED)).toBe(429);
    expect(httpStatusForCode(ErrorCode.REPORT_NOT_CLAIMABLE)).toBe(409);
    expect(httpStatusForCode(ErrorCode.SELF_CLAIM_NOT_ALLOWED)).toBe(403);
    expect(httpStatusForCode(ErrorCode.UPLOAD_INVALID_TYPE)).toBe(415);
    expect(httpStatusForCode(ErrorCode.UPLOAD_TOO_LARGE)).toBe(413);
    expect(httpStatusForCode(ErrorCode.UPLOAD_LIMIT_REACHED)).toBe(409);
    expect(httpStatusForCode(ErrorCode.RATE_LIMITED)).toBe(429);
    expect(httpStatusForCode(ErrorCode.ML_UNAVAILABLE)).toBe(503);
    expect(httpStatusForCode(ErrorCode.INTERNAL)).toBe(500);
  });

  it("DomainError produces the correct BE-01 error envelope shape", async () => {
    const { DomainError, ErrorCode, toErrorResponse } = await import("./errors");
    const err = new DomainError(ErrorCode.VALIDATION_FAILED, "Invalid request body", {
      fields: [{ path: "title", key: "error.field.title.required" }],
    });
    const envelope = toErrorResponse(err, "req_test123");
    expect(envelope).toEqual({
      error: {
        code: "VALIDATION_FAILED",
        message: "Invalid request body",
        details: {
          fields: [{ path: "title", key: "error.field.title.required" }],
        },
        requestId: "req_test123",
      },
    });
  });

  it("DomainError without details omits the details field", async () => {
    const { DomainError, ErrorCode, toErrorResponse } = await import("./errors");
    const err = new DomainError(ErrorCode.NOT_FOUND, "Resource not found");
    const envelope = toErrorResponse(err, "req_test456");
    expect(envelope.error.details).toBeUndefined();
    expect(envelope.error.code).toBe("NOT_FOUND");
    expect(envelope.error.requestId).toBe("req_test456");
  });

  it("toErrorResponse handles unknown errors as INTERNAL", async () => {
    const { toErrorResponse } = await import("./errors");
    const envelope = toErrorResponse(new Error("oops"), "req_test789");
    expect(envelope.error.code).toBe("INTERNAL");
    expect(envelope.error.requestId).toBe("req_test789");
    // Must not include stack trace per BE-04 rule 4
    expect(envelope.error.message).not.toContain("at ");
  });
});
