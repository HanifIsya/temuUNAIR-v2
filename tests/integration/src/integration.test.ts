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

describe("Integration tests with testcontainers", () => {
  const hasDocker = isDockerRunning();

  it("checks container orchestration environment", () => {
    expect(GenericContainer).toBeDefined();
    if (!hasDocker) {
      console.log(
        "Notice: Docker is not available in the current environment; container spin-up skipped locally.",
      );
    }
  });

  it.runIf(hasDocker)(
    "can start and communicate with a container",
    async () => {
      const container = await new GenericContainer("alpine:latest")
        .withCommand(["echo", "hello-world"])
        .start();

      try {
        expect(container.getId()).toBeDefined();
      } finally {
        await container.stop();
      }
    },
    60000,
  );
});
