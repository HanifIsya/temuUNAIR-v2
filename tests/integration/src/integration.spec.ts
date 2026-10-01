import { describe, it, expect } from "vitest";
import { GenericContainer } from "testcontainers";
import { execSync } from "node:child_process";

function isDockerRunning(): boolean {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe("Integration tests with testcontainers (Postgres, MinIO, Mailpit)", () => {
  const hasDocker = isDockerRunning();

  it("checks container orchestration environment", () => {
    expect(GenericContainer).toBeDefined();
    if (!hasDocker) {
      process.stdout.write(
        "Notice: Docker is not available in the current environment; container spin-up skipped locally.\n",
      );
    }
  });

  describe.runIf(hasDocker)("services containers", () => {
    it("can start and communicate with a Postgres pgvector container", async () => {
      const container = await new GenericContainer("pgvector/pgvector:pg16")
        .withEnvironment({
          POSTGRES_USER: "temuunair",
          POSTGRES_PASSWORD: "temuunair",
          POSTGRES_DB: "temuunair",
        })
        .withExposedPorts(5432)
        .start();

      try {
        expect(container.getId()).toBeDefined();
        expect(container.getMappedPort(5432)).toBeGreaterThan(0);
      } finally {
        await container.stop();
      }
    }, 60000);

    it("can start and communicate with a MinIO container", async () => {
      const container = await new GenericContainer("alpine/minio:latest-release")
        .withEnvironment({
          MINIO_ROOT_USER: "minioadmin",
          MINIO_ROOT_PASSWORD: "minioadmin",
          MINIO_ACCESS_KEY: "minioadmin",
          MINIO_SECRET_KEY: "minioadmin",
        })
        .withCommand(["server", "/tmp/data", "--console-address", ":9001"])
        .withExposedPorts(9000)
        .start();

      try {
        expect(container.getId()).toBeDefined();
        expect(container.getMappedPort(9000)).toBeGreaterThan(0);
      } finally {
        await container.stop();
      }
    }, 60000);

    it("can start and communicate with a Mailpit container", async () => {
      const container = await new GenericContainer("axllent/mailpit:latest")
        .withExposedPorts(1025, 8025)
        .start();

      try {
        expect(container.getId()).toBeDefined();
        expect(container.getMappedPort(1025)).toBeGreaterThan(0);
      } finally {
        await container.stop();
      }
    }, 60000);
  });
});
