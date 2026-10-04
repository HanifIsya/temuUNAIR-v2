// apps/web/src/server/config.ts
// Startup env validation per BE-11. Parsed at boot with Zod; no handler reads
// process.env directly. Missing or invalid vars fail fast with a readable error.

import { z } from "zod";

/** CSV string → trimmed, lowercased, non-empty array (BE-11 rule 3). */
const csvDomains = z
  .string()
  .min(1, "AUTH_ALLOWED_DOMAINS must not be empty")
  .transform((s) =>
    s
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
  )
  .refine((arr) => arr.length > 0, {
    message: "AUTH_ALLOWED_DOMAINS must contain at least one domain",
  });

/** Base64 string that decodes to exactly 32 bytes (BE-11 rule 4). */
const base64_32B = z
  .string()
  .min(1)
  .refine(
    (s) => {
      try {
        return Buffer.from(s, "base64").length === 32;
      } catch {
        return false;
      }
    },
    { message: "Must be a base64 string that decodes to exactly 32 bytes" },
  );

const booleanString = z
  .string()
  .default("true")
  .transform((s) => s === "true" || s === "1");

const envSchema = z.object({
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: base64_32B,
  AUTH_GOOGLE_ID: z.string().min(1, "AUTH_GOOGLE_ID is required"),
  AUTH_GOOGLE_SECRET: z.string().min(1, "AUTH_GOOGLE_SECRET is required"),
  AUTH_ALLOWED_DOMAINS: csvDomains,
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_PUBLIC_BASE_URL: z.string().url(),
  ML_SERVICE_URL: z.string().url().default("http://localhost:8000"),
  ML_SERVICE_TOKEN: z.string().min(1, "ML_SERVICE_TOKEN is required"),
  ML_MODE: z.enum(["stub", "real"]).default("stub"),
  SMTP_URL: z.string().min(1, "SMTP_URL is required"),
  EMAIL_FROM: z.string().min(1).default("TemuUNAIR <no-reply@temuunair.local>"),
  FIELD_ENCRYPTION_KEY: base64_32B,
  REPORT_TTL_DAYS: z.coerce.number().int().positive().default(90),
  CLAIM_TTL_HOURS: z.coerce.number().int().positive().default(72),
  MATCH_THRESHOLD_STRONG: z.coerce.number().min(0).max(1).default(0.75),
  MATCH_THRESHOLD_POSSIBLE: z.coerce.number().min(0).max(1).default(0.55),
  RATE_LIMIT_ENABLED: booleanString,
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_API_MOCKING: z.enum(["enabled", "disabled"]).default("disabled"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type AppConfig = {
  appBaseUrl: string;
  databaseUrl: string;
  authSecret: string;
  authGoogleId: string;
  authGoogleSecret: string;
  authAllowedDomains: string[];
  s3Endpoint: string;
  s3Region: string;
  s3Bucket: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3PublicBaseUrl: string;
  mlServiceUrl: string;
  mlServiceToken: string;
  mlMode: "stub" | "real";
  smtpUrl: string;
  emailFrom: string;
  fieldEncryptionKey: string;
  reportTtlDays: number;
  claimTtlHours: number;
  matchThresholdStrong: number;
  matchThresholdPossible: number;
  rateLimitEnabled: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  sentryDsn: string | undefined;
  nextPublicApiMocking: "enabled" | "disabled";
  nextPublicAppUrl: string;
};

/**
 * Parse and validate environment variables. Call at boot.
 * Throws a readable error listing every missing/invalid variable.
 */
export function parseConfig(env: Record<string, string | undefined>): AppConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  const d = result.data;
  return {
    appBaseUrl: d.APP_BASE_URL,
    databaseUrl: d.DATABASE_URL,
    authSecret: d.AUTH_SECRET,
    authGoogleId: d.AUTH_GOOGLE_ID,
    authGoogleSecret: d.AUTH_GOOGLE_SECRET,
    authAllowedDomains: d.AUTH_ALLOWED_DOMAINS,
    s3Endpoint: d.S3_ENDPOINT,
    s3Region: d.S3_REGION,
    s3Bucket: d.S3_BUCKET,
    s3AccessKey: d.S3_ACCESS_KEY,
    s3SecretKey: d.S3_SECRET_KEY,
    s3PublicBaseUrl: d.S3_PUBLIC_BASE_URL,
    mlServiceUrl: d.ML_SERVICE_URL,
    mlServiceToken: d.ML_SERVICE_TOKEN,
    mlMode: d.ML_MODE,
    smtpUrl: d.SMTP_URL,
    emailFrom: d.EMAIL_FROM,
    fieldEncryptionKey: d.FIELD_ENCRYPTION_KEY,
    reportTtlDays: d.REPORT_TTL_DAYS,
    claimTtlHours: d.CLAIM_TTL_HOURS,
    matchThresholdStrong: d.MATCH_THRESHOLD_STRONG,
    matchThresholdPossible: d.MATCH_THRESHOLD_POSSIBLE,
    rateLimitEnabled: d.RATE_LIMIT_ENABLED,
    logLevel: d.LOG_LEVEL,
    sentryDsn: d.SENTRY_DSN,
    nextPublicApiMocking: d.NEXT_PUBLIC_API_MOCKING,
    nextPublicAppUrl: d.NEXT_PUBLIC_APP_URL,
  };
}
