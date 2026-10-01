import { describe, it, expect, vi } from "vitest";
import { createWorker } from "./worker.js";
import { QUEUES } from "./registry.js";

vi.mock("pg-boss", () => {
  return {
    default: class MockPgBoss {
      public start = vi.fn().mockResolvedValue(undefined);
      public stop = vi.fn().mockResolvedValue(undefined);
      public work = vi.fn().mockResolvedValue(undefined);
      constructor(public options: unknown) {}
    },
  };
});

describe("Worker bootstrap", () => {
  it("throws when DATABASE_URL is not set and no connectionString provided", () => {
    const originalUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      expect(() => createWorker()).toThrow("DATABASE_URL is not set");
    } finally {
      process.env.DATABASE_URL = originalUrl;
    }
  });

  it("creates a worker instance with all BE-07 queues", () => {
    const worker = createWorker({ connectionString: "postgres://user:pass@localhost:5432/db" });
    expect(worker.registeredQueues).toEqual(Object.keys(QUEUES));
    expect(worker.registeredQueues.length).toBe(8);
  });

  it("starts the boss instance and registers handlers for every queue", async () => {
    const worker = createWorker({ connectionString: "postgres://user:pass@localhost:5432/db" });
    await worker.start();

    expect(worker.boss.start).toHaveBeenCalledTimes(1);
    expect(worker.boss.work).toHaveBeenCalledTimes(8);

    for (const queue of Object.keys(QUEUES)) {
      expect(worker.boss.work).toHaveBeenCalledWith(queue, expect.any(Function));
    }
  });

  it("stops the boss instance gracefully", async () => {
    const worker = createWorker({ connectionString: "postgres://user:pass@localhost:5432/db" });
    await worker.stop();
    expect(worker.boss.stop).toHaveBeenCalledWith({ graceful: true, timeout: 5000 });
  });
});
