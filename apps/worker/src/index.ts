import { createWorker } from "./worker.js";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    process.stderr.write("worker: DATABASE_URL is not set — exiting\n");
    process.exit(1);
  }

  const worker = createWorker({ connectionString: databaseUrl });

  const shutdown = async (signal: string) => {
    process.stdout.write(`\nworker: received ${signal}, shutting down gracefully...\n`);
    try {
      await worker.stop();
      process.stdout.write("worker: stopped\n");
      process.exit(0);
    } catch (err) {
      process.stderr.write(`worker: error during shutdown: ${String(err)}\n`);
      process.exit(1);
    }
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));

  process.stdout.write("worker: starting pg-boss consumer...\n");
  await worker.start();
  process.stdout.write(
    `worker: registered ${worker.registeredQueues.length} queues: ${worker.registeredQueues.join(", ")}\n`,
  );
}

if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    process.stderr.write(`worker: fatal error: ${String(err)}\n`);
    process.exit(1);
  });
}
