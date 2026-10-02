import { randomBytes } from "node:crypto";
import { createRequire, enableCompileCache } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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

/** Hard ceiling so a stalled endpoint can never hang `pnpm gate` or the CI migrations job. */
const CHECK_DEADLINE_MS = 60_000;
/** Cleanup budget: long enough for the worker to drop the scratch database, never unbounded. */
const FINISH_MS = 10_000;
const CONNECT_TIMEOUT_MS = 10_000;

/** Reject with a typed error once `ms` elapses; the in-flight work is left to be cleaned up. */
function withDeadline<T>(ms: number, work: () => Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pending = work();
  pending.catch(() => undefined); // the deadline may win; never leave an unhandled rejection
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`db:check: timed out after ${ms} ms`)), ms);
  });
  return Promise.race([pending, deadline]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
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

  // Parse up front and swallow the failure: a malformed DATABASE_URL must return 1, never
  // reject. A rejection escapes `runCheck` and Node dumps the error's enumerable properties —
  // including the offending URL, credentials and all — straight to stderr, which contradicts the
  // "never logs the URL" contract stated at the top of this file and in AGENTS.md rule 5.
  let scratchUrl: URL;
  try {
    scratchUrl = new URL(databaseUrl);
  } catch {
    deps.error("db:check: failed: DATABASE_URL is not a valid URL");
    return 1;
  }

  const scratchName = `tmu_check_${Date.now()}_${randomBytes(6).toString("hex")}`;
  scratchUrl.pathname = `/${scratchName}`;

  let pool: Pool | undefined;
  let worker: Worker | undefined;
  let inbox: WorkerInbox | undefined;
  try {
    enableCompileCache();

    const code = await withDeadline(CHECK_DEADLINE_MS, async () => {
      // Spawn first: the worker's connect + CREATE + migrate runs while this thread loads the
      // heavy modules below.
      worker = new Worker(new URL("./check-worker.ts", import.meta.url), {
        workerData: {
          sourceUrl: databaseUrl,
          scratchName,
          migrationsDir:
            migrationsDir ?? resolve(fileURLToPath(import.meta.url), "../../migrations"),
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
          pool = new pg.Pool({
            connectionString: scratchUrl.toString(),
            max: 1,
            connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
          });
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
    });
    return code;
  } catch (cause) {
    deps.error(`db:check: failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    return 1;
  } finally {
    // Cleanup must be bounded too. `withDeadline` above stops covering this block the moment the
    // try/catch resolves, so an unbounded `inbox.next()` here would hang `runCheck` forever even
    // after the deadline fired — which is exactly how a wedged worker turns into a stuck gate.
    await withDeadline(FINISH_MS, async () => {
      if (pool) {
        await pool.end().catch(() => undefined);
      }
      if (worker && inbox) {
        try {
          worker.postMessage({ phase: "finish" });
        } catch {
          // Worker already gone.
        }
        if (!inbox.exited) {
          await inbox.next(); // "done" after the drop, or "exit" if the worker died
        }
      }
    }).catch(() => undefined);
    if (worker) {
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
