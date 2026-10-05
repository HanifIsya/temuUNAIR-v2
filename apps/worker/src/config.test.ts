import { describe, expect, it } from "vitest";
import { assertProdConfig, parseWorkerConfig } from "./config.js";

// TMU-BE-007: worker env parsing per BE-11 — ML_* defaults (ML_MODE=stub), S3 storage
// defaults for presigned image URLs, and the production guard that forbids ML_MODE=stub.

describe("parseWorkerConfig", () => {
  it("applies the BE-11 defaults (ML_MODE=stub, MinIO dev storage)", () => {
    const cfg = parseWorkerConfig({});

    expect(cfg.mlMode).toBe("stub");
    expect(cfg.mlServiceUrl).toBe("http://localhost:8000");
    expect(cfg.mlServiceToken).toBe("dev-ml-token");
    expect(cfg.s3Bucket).toBe("temuunair-dev");
    expect(cfg.s3PublicBaseUrl).toBe("http://localhost:9000/temuunair-dev");
  });

  it("derives the storage host allowlist from the S3 endpoint and public base URL", () => {
    const cfg = parseWorkerConfig({
      S3_ENDPOINT: "http://localhost:9000",
      S3_PUBLIC_BASE_URL: "http://localhost:9000/temuunair-dev",
    });
    expect(cfg.allowedStorageOrigins).toEqual(["http://localhost:9000"]);

    const cfg2 = parseWorkerConfig({
      S3_ENDPOINT: "http://minio.internal:9000",
      S3_PUBLIC_BASE_URL: "https://cdn.example.ac.id/bucket",
    });
    expect(cfg2.allowedStorageOrigins).toEqual([
      "http://minio.internal:9000",
      "https://cdn.example.ac.id",
    ]);
  });

  it("reads explicit overrides", () => {
    const cfg = parseWorkerConfig({
      ML_MODE: "real",
      ML_SERVICE_URL: "http://ml:8000",
      ML_SERVICE_TOKEN: "prod-token",
    });
    expect(cfg.mlMode).toBe("real");
    expect(cfg.mlServiceUrl).toBe("http://ml:8000");
    expect(cfg.mlServiceToken).toBe("prod-token");
  });

  it("rejects an unknown ML_MODE", () => {
    expect(() => parseWorkerConfig({ ML_MODE: "magic" })).toThrow();
  });
});

describe("assertProdConfig", () => {
  it("forbids ML_MODE=stub when NODE_ENV=production (BE-11 rule 5)", () => {
    const cfg = parseWorkerConfig({ ML_MODE: "stub" });
    expect(() => assertProdConfig(cfg, { NODE_ENV: "production" })).toThrow(/ML_MODE/);
  });

  it("allows ML_MODE=real in production and stub outside production", () => {
    const real = parseWorkerConfig({ ML_MODE: "real" });
    expect(() => assertProdConfig(real, { NODE_ENV: "production" })).not.toThrow();
    const stub = parseWorkerConfig({ ML_MODE: "stub" });
    expect(() => assertProdConfig(stub, { NODE_ENV: "test" })).not.toThrow();
  });
});
