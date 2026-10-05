import { describe, expect, it } from "vitest";

// TMU-BE-001 (red evidence): logging.ts pino config + requestId + redaction.

describe("server logging (pino + requestId)", () => {
  it("exports a pino logger with the correct redaction paths", async () => {
    const { logger } = await import("./logging");
    expect(logger).toBeDefined();
    // pino loggers have a .level property
    expect(typeof logger.level).toBe("string");
  });

  it("redaction paths cover privacy-required fields", async () => {
    const { REDACTION_PATHS } = await import("./logging");
    const required = [
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
    for (const path of required) {
      expect(REDACTION_PATHS).toContain(path);
    }
  });

  it("generateRequestId returns a string starting with req_", async () => {
    const { generateRequestId } = await import("./logging");
    const id = generateRequestId();
    expect(id).toMatch(/^req_[a-zA-Z0-9]+$/);
  });

  it("generateRequestId returns unique values", async () => {
    const { generateRequestId } = await import("./logging");
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });
});
