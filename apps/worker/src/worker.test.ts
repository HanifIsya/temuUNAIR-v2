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
      if (queue === "report.process") {
        // BE-07 needs job metadata (retryCount/retryLimit) for dead-letter detection.
        expect(worker.boss.work).toHaveBeenCalledWith(
          queue,
          { includeMetadata: true },
          expect.any(Function),
        );
      } else {
        expect(worker.boss.work).toHaveBeenCalledWith(queue, expect.any(Function));
      }
    }
  });

  it("stops the boss instance gracefully", async () => {
    const worker = createWorker({ connectionString: "postgres://user:pass@localhost:5432/db" });
    await worker.stop();
    expect(worker.boss.stop).toHaveBeenCalledWith({ graceful: true, timeout: 5000 });
  });

  it("executes registered queue handler on incoming jobs and validates payload", async () => {
    const runner = vi.fn(async () => undefined);
    const worker = createWorker({
      connectionString: "postgres://user:pass@localhost:5432/db",
      reportProcess: runner,
    });
    await worker.start();

    const workMock = worker.boss.work as unknown as ReturnType<typeof vi.fn>;
    const reportProcessCall = workMock.mock.calls.find((call) => call[0] === "report.process");
    expect(reportProcessCall).toBeDefined();
    expect(reportProcessCall![1]).toEqual({ includeMetadata: true });
    const handler = reportProcessCall![2] as (jobs: unknown[]) => Promise<void>;

    // Valid job execution reaches the injected report.process runner
    const validJob = {
      id: "job-123",
      data: { reportId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
      retryCount: 0,
      retryLimit: 3,
    };
    await expect(handler([validJob])).resolves.not.toThrow();
    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner).toHaveBeenCalledWith([validJob]);

    // Invalid job execution throws ZodError before the runner is invoked
    const invalidJob = {
      id: "job-456",
      data: { reportId: "not-a-uuid" },
    };
    await expect(handler([invalidJob])).rejects.toThrow();
    expect(runner).toHaveBeenCalledTimes(1);

    // Cron sweep job with null data succeeds without crashing
    const sweepCall = workMock.mock.calls.find((call) => call[0] === "report.expire-sweep");
    expect(sweepCall).toBeDefined();
    const sweepHandler = sweepCall![1];
    await expect(sweepHandler([{ id: "sweep-1", data: null }])).resolves.not.toThrow();
  });
});
