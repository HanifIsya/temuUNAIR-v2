import { describe, expect, it } from "vitest";

// TMU-BE-001 (red evidence): config.ts env validation (BE-11).

describe("server config (BE-11)", () => {
  it("exports a valid config object when all env vars are present", async () => {
    const { parseConfig } = await import("./config");
    const config = parseConfig({
      APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://temuunair:temuunair@localhost:5432/temuunair",
      AUTH_SECRET: Buffer.from("a".repeat(32)).toString("base64"),
      AUTH_GOOGLE_ID: "test-client-id",
      AUTH_GOOGLE_SECRET: "test-client-secret",
      AUTH_ALLOWED_DOMAINS: "unair.ac.id,student.unair.ac.id",
      S3_ENDPOINT: "http://localhost:9000",
      S3_REGION: "us-east-1",
      S3_BUCKET: "temuunair-dev",
      S3_ACCESS_KEY: "minioadmin",
      S3_SECRET_KEY: "minioadmin",
      S3_PUBLIC_BASE_URL: "http://localhost:9000/temuunair-dev",
      ML_SERVICE_URL: "http://localhost:8000",
      ML_SERVICE_TOKEN: "dev-token",
      ML_MODE: "stub",
      SMTP_URL: "smtp://localhost:1025",
      EMAIL_FROM: "TemuUNAIR <no-reply@temuunair.local>",
      FIELD_ENCRYPTION_KEY: Buffer.from("b".repeat(32)).toString("base64"),
      REPORT_TTL_DAYS: "90",
      CLAIM_TTL_HOURS: "72",
      MATCH_THRESHOLD_STRONG: "0.75",
      MATCH_THRESHOLD_POSSIBLE: "0.55",
      RATE_LIMIT_ENABLED: "true",
      LOG_LEVEL: "info",
    });
    expect(config.appBaseUrl).toBe("http://localhost:3000");
    expect(config.databaseUrl).toContain("postgresql://");
    expect(config.authAllowedDomains).toEqual(["unair.ac.id", "student.unair.ac.id"]);
    expect(config.mlMode).toBe("stub");
    expect(config.reportTtlDays).toBe(90);
    expect(config.claimTtlHours).toBe(72);
    expect(config.matchThresholdStrong).toBe(0.75);
    expect(config.matchThresholdPossible).toBe(0.55);
    expect(config.rateLimitEnabled).toBe(true);
    expect(config.logLevel).toBe("info");
  });

  it("throws a readable error listing missing required vars", async () => {
    const { parseConfig } = await import("./config");
    expect(() => parseConfig({})).toThrow(/DATABASE_URL|AUTH_SECRET/);
  });

  it("rejects AUTH_ALLOWED_DOMAINS when empty (fails startup per BE-11 rule 3)", async () => {
    const { parseConfig } = await import("./config");
    expect(() =>
      parseConfig({
        APP_BASE_URL: "http://localhost:3000",
        DATABASE_URL: "postgresql://temuunair:temuunair@localhost:5432/temuunair",
        AUTH_SECRET: Buffer.from("a".repeat(32)).toString("base64"),
        AUTH_GOOGLE_ID: "id",
        AUTH_GOOGLE_SECRET: "secret",
        AUTH_ALLOWED_DOMAINS: "",
        S3_ENDPOINT: "http://localhost:9000",
        S3_REGION: "us-east-1",
        S3_BUCKET: "temuunair-dev",
        S3_ACCESS_KEY: "minioadmin",
        S3_SECRET_KEY: "minioadmin",
        S3_PUBLIC_BASE_URL: "http://localhost:9000/temuunair-dev",
        ML_SERVICE_URL: "http://localhost:8000",
        ML_SERVICE_TOKEN: "dev-token",
        ML_MODE: "stub",
        SMTP_URL: "smtp://localhost:1025",
        EMAIL_FROM: "TemuUNAIR <no-reply@temuunair.local>",
        FIELD_ENCRYPTION_KEY: Buffer.from("b".repeat(32)).toString("base64"),
      }),
    ).toThrow(/AUTH_ALLOWED_DOMAINS/i);
  });

  it("rejects FIELD_ENCRYPTION_KEY that does not decode to exactly 32 bytes", async () => {
    const { parseConfig } = await import("./config");
    expect(() =>
      parseConfig({
        APP_BASE_URL: "http://localhost:3000",
        DATABASE_URL: "postgresql://temuunair:temuunair@localhost:5432/temuunair",
        AUTH_SECRET: Buffer.from("a".repeat(32)).toString("base64"),
        AUTH_GOOGLE_ID: "id",
        AUTH_GOOGLE_SECRET: "secret",
        AUTH_ALLOWED_DOMAINS: "unair.ac.id",
        S3_ENDPOINT: "http://localhost:9000",
        S3_REGION: "us-east-1",
        S3_BUCKET: "temuunair-dev",
        S3_ACCESS_KEY: "minioadmin",
        S3_SECRET_KEY: "minioadmin",
        S3_PUBLIC_BASE_URL: "http://localhost:9000/temuunair-dev",
        ML_SERVICE_URL: "http://localhost:8000",
        ML_SERVICE_TOKEN: "dev-token",
        ML_MODE: "stub",
        SMTP_URL: "smtp://localhost:1025",
        EMAIL_FROM: "TemuUNAIR <no-reply@temuunair.local>",
        FIELD_ENCRYPTION_KEY: "tooshort",
      }),
    ).toThrow(/FIELD_ENCRYPTION_KEY/i);
  });

  it("applies defaults for optional vars (REPORT_TTL_DAYS, LOG_LEVEL, etc.)", async () => {
    const { parseConfig } = await import("./config");
    const config = parseConfig({
      APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://temuunair:temuunair@localhost:5432/temuunair",
      AUTH_SECRET: Buffer.from("a".repeat(32)).toString("base64"),
      AUTH_GOOGLE_ID: "id",
      AUTH_GOOGLE_SECRET: "secret",
      AUTH_ALLOWED_DOMAINS: "unair.ac.id",
      S3_ENDPOINT: "http://localhost:9000",
      S3_REGION: "us-east-1",
      S3_BUCKET: "temuunair-dev",
      S3_ACCESS_KEY: "minioadmin",
      S3_SECRET_KEY: "minioadmin",
      S3_PUBLIC_BASE_URL: "http://localhost:9000/temuunair-dev",
      ML_SERVICE_URL: "http://localhost:8000",
      ML_SERVICE_TOKEN: "dev-token",
      SMTP_URL: "smtp://localhost:1025",
      EMAIL_FROM: "TemuUNAIR <no-reply@temuunair.local>",
      FIELD_ENCRYPTION_KEY: Buffer.from("b".repeat(32)).toString("base64"),
    });
    expect(config.reportTtlDays).toBe(90);
    expect(config.claimTtlHours).toBe(72);
    expect(config.matchThresholdStrong).toBe(0.75);
    expect(config.matchThresholdPossible).toBe(0.55);
    expect(config.rateLimitEnabled).toBe(true);
    expect(config.logLevel).toBe("info");
    expect(config.mlMode).toBe("stub");
  });
});
