// apps/worker/src/config.ts
// Worker env parsing per BE-11 (ML_* + S3_* rows) with production guards.

export interface WorkerConfig {
  mlMode: "stub" | "real";
  mlServiceUrl: string;
  mlServiceToken: string;
  s3Endpoint: string;
  s3Region: string;
  s3Bucket: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3PublicBaseUrl: string;
  allowedStorageOrigins: string[];
}

type Env = Record<string, string | undefined>;

function originOf(url: string): string {
  return new URL(url).origin;
}

export function parseWorkerConfig(env: Env): WorkerConfig {
  const mlMode = env.ML_MODE ?? "stub";
  if (mlMode !== "stub" && mlMode !== "real") {
    throw new Error(`ML_MODE must be "stub" or "real", got "${mlMode}"`);
  }

  const s3Endpoint = env.S3_ENDPOINT ?? "http://localhost:9000";
  const s3PublicBaseUrl = env.S3_PUBLIC_BASE_URL ?? "http://localhost:9000/temuunair-dev";
  const allowedStorageOrigins = [...new Set([originOf(s3Endpoint), originOf(s3PublicBaseUrl)])];

  return {
    mlMode,
    mlServiceUrl: env.ML_SERVICE_URL ?? "http://localhost:8000",
    mlServiceToken: env.ML_SERVICE_TOKEN ?? "dev-ml-token",
    s3Endpoint,
    s3Region: env.S3_REGION ?? "us-east-1",
    s3Bucket: env.S3_BUCKET ?? "temuunair-dev",
    s3AccessKey: env.S3_ACCESS_KEY ?? "minioadmin",
    s3SecretKey: env.S3_SECRET_KEY ?? "minioadmin",
    s3PublicBaseUrl,
    allowedStorageOrigins,
  };
}

/** BE-11 rule 5: ML_MODE=stub is forbidden when NODE_ENV=production. */
export function assertProdConfig(config: WorkerConfig, env: Env): void {
  if (env.NODE_ENV === "production" && config.mlMode === "stub") {
    throw new Error("ML_MODE=stub is forbidden in production (set ML_MODE=real)");
  }
}

let cached: WorkerConfig | undefined;

export function getWorkerConfig(): WorkerConfig {
  if (!cached) {
    cached = parseWorkerConfig(process.env);
    assertProdConfig(cached, process.env);
  }
  return cached;
}
