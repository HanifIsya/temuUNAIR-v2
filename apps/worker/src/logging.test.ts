import { describe, expect, it } from "vitest";
import { WORKER_REDACTION_PATHS, createWorkerLogger, scrubMessage } from "./logging.js";

// TMU-BE-007: structured pino logging with the privacy redaction list — job logs may
// never contain hint answers, emails, image URLs or raw report text.

describe("WORKER_REDACTION_PATHS", () => {
  it("covers authorization, PII fields and image URLs", () => {
    expect(WORKER_REDACTION_PATHS).toContain("req.headers.authorization");
    expect(WORKER_REDACTION_PATHS).toContain("*.email");
    expect(WORKER_REDACTION_PATHS).toContain("*.answer");
    expect(WORKER_REDACTION_PATHS).toContain("*.answer_enc");
    expect(WORKER_REDACTION_PATHS).toContain("*.token");
    expect(WORKER_REDACTION_PATHS).toContain("*.imageUrl");
    expect(WORKER_REDACTION_PATHS).toContain("*.text");
    expect(WORKER_REDACTION_PATHS).toContain("*.title");
    expect(WORKER_REDACTION_PATHS).toContain("*.description");
  });
});

describe("createWorkerLogger", () => {
  it("redacts sensitive fields in emitted records", () => {
    const lines: string[] = [];
    const logger = createWorkerLogger({
      level: "info",
      stream: { write: (chunk: string) => lines.push(chunk) },
    });

    logger.info({
      reportId: "r-1",
      imageUrl: "http://localhost:9000/b/img.jpg?X-Amz-Signature=abc",
      email: "budi@student.unair.ac.id",
      token: "secret",
    });

    const output = lines.join("");
    expect(output).toContain("r-1");
    expect(output).toContain("[redacted]");
    expect(output).not.toContain("X-Amz-Signature");
    expect(output).not.toContain("budi@student.unair.ac.id");
    expect(output).not.toContain("secret");
  });
});

describe("scrubMessage", () => {
  it("strips URLs and numeric-array payloads (embeddings) from error text", () => {
    const withUrl = scrubMessage(
      "fetch http://localhost:9000/b/img.jpg?X-Amz-Signature=abc failed",
    );
    expect(withUrl).toBe("fetch [url] failed");

    const vector = `invalid input syntax for type vector: {${Array.from(
      { length: 12 },
      (_, i) => `"0.0${i}"`,
    ).join(",")}}`;
    expect(scrubMessage(vector)).toBe("invalid input syntax for type vector: [array]");

    const jsonVector = scrubMessage("bad embedding [0.1, 0.2, 0.3, 0.4, 0.5]");
    expect(jsonVector).toBe("bad embedding [vector]");
  });
});
