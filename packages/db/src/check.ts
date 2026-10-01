import { randomBytes } from "node:crypto";
import { createRequire, enableCompileCache } from "node:module";
import { pathToFileURL } from "node:url";
import { Worker } from "node:worker_threads";
import type { Pool } from "pg";

// db:check (TMU-OPS-005): apply the migration folder to a throwaway database and diff the
// result against the Drizzle schema. Never mutates `databaseUrl` (no sslmode rewriting: CI is
// plaintext, the hosted instance carries `?sslmode=require`) and never logs the URL.
//
// The work is split across two threads so the check fits the frozen 5 s Vitest timeout of the
// live tests: the worker (check-worker.ts) owns the network-heavy scratch lifecycle (connect,
// CREATE, migrate, drop) while this thread loads drizzle-kit — its 2.8 MB bundle costs over a
// second of pure CPU — and then runs the pushSchema diff over its own connection to the scratch
// database. The skip path returns before anything is loaded.

export interface RunCheckOptions {
  databaseUrl?: string | undefined;
  migrationsDir?: string | undefined;
}

export interface RunCheckDeps {
  log: (message: string) => void;
  error: (message: string) => void;
}

interface WorkerMessage {
  phase: string;
  message?: string;
}

const require = createRequire(import.meta.url);

/** FIFO queue of worker messages; anything posted while busy stays buffered, nothing is lost. */
class WorkerInbox {
  private readonly pending: WorkerMessage[] = [];
  private readonly waiters: Array<(message: WorkerMessage) => void> = [];
  private workerExited = false;

  constructor(worker: Worker) {
    worker.on("message", (message: WorkerMessage) => this.push(message));
    worker.on("error", (error: Error) => {
      this.workerExited = true;
      this.push({ phase: "exit", message: error.message });
    });
    worker.on("exit", () => {
      this.workerExited = true;
      this.push({ phase: "exit" });
    });
  }

  get exited(): boolean {
    return this.workerExited;
  }

  private push(message: WorkerMessage): void {
    const waiter = this.waiters.shift();
    if (waiter) waiter(message);
    else this.pending.push(message);
  }

  next(): Promise<WorkerMessage> {
    const buffered = this.pending.shift();
    if (buffered) return Promise.resolve(buffered);
    return new Promise((resolve) => this.waiters.push(resolve));
  }
}

export async function runCheck(options: RunCheckOptions, deps: RunCheckDeps): Promise<number> {
  const { databaseUrl, migrationsDir } = options;
  if (!databaseUrl) {
    deps.log("db:check: skipped (DATABASE_URL is not set)");
    return 0;
  }

  const scratchName = `tmu_check_${Date.now()}_${randomBytes(6).toString("hex")}`;
  const scratchUrl = new URL(databaseUrl);
  scratchUrl.pathname = `/${scratchName}`;

  let pool: Pool | undefined;
  let worker: Worker | undefined;
  let inbox: WorkerInbox | undefined;
  try {
    enableCompileCache();

    // Spawn first: the worker's connect + CREATE + migrate runs while this thread loads the
    // heavy modules below.
    worker = new Worker(new URL("./check-worker.ts", import.meta.url), {
      workerData: {
        sourceUrl: databaseUrl,
        scratchName,
        migrationsDir: migrationsDir ?? "./migrations",
      },
    });
    inbox = new WorkerInbox(worker);

    const pg = require("pg") as typeof import("pg");
    const drizzleModule =
      require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
    const schemaModule = await import("./schema.js");
    const kitModule = require("drizzle-kit/api") as typeof import("drizzle-kit/api");

    for (;;) {
      const message = await inbox.next();
      if (message.phase === "scratch-ready") {
        // Open this thread's connection while the worker is still migrating, so the pushSchema
        // diff below reuses it instead of paying for another handshake.
        pool = new pg.Pool({ connectionString: scratchUrl.toString(), max: 1 });
        const client = await pool.connect();
        client.release();
      } else if (message.phase === "migrate-done") {
        break;
      } else {
        throw new Error(message.message ?? `db:check worker stopped (${message.phase})`);
      }
    }
    if (!pool) throw new Error("db:check lost its scratch connection");

    const { statementsToExecute } = await kitModule.pushSchema(
      schemaModule as unknown as Record<string, unknown>,
      drizzleModule.drizzle(pool),
      ["public"],
    );
    if (statementsToExecute.length > 0) {
      deps.error(
        `db:check: drift: ${statementsToExecute.length} statement(s) would bring the database ` +
          `in line with src/schema.ts (scratch database "${scratchName}")`,
      );
      return 1;
    }
    deps.log("db:check: ok");
    return 0;
  } catch (cause) {
    deps.error(`db:check: failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    return 1;
  } finally {
    if (pool) {
      await pool.end().catch(() => undefined);
    }
    if (worker) {
      if (inbox) {
        try {
          worker.postMessage({ phase: "finish" });
        } catch {
          // Worker already gone.
        }
        if (!inbox.exited) {
          await inbox.next(); // "done" after the drop, or "exit" if the worker died
        }
      }
      await worker.terminate().catch(() => undefined);
    }
  }
}

const isCli =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  process.exitCode = await runCheck(
    { databaseUrl: process.env.DATABASE_URL, migrationsDir: undefined },
    { log: (m) => process.stdout.write(`${m}\n`), error: (m) => process.stderr.write(`${m}\n`) },
  );
}
