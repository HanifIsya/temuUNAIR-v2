import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

// Forward-only migration runner (BE-05). Applies packages/db/migrations to DATABASE_URL.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  process.stdout.write("migrate: skipped (DATABASE_URL is not set)\n");
} else {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  try {
    await migrate(drizzle(pool), { migrationsFolder: "./migrations" });
    process.stdout.write("migrate: ok\n");
  } catch (cause) {
    process.stderr.write(
      `migrate: failed: ${cause instanceof Error ? cause.message : String(cause)}\n`,
    );
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => undefined);
  }
}
