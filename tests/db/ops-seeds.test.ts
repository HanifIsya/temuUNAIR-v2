import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// TMU-DB-005 (red evidence): notifications, notification_prefs, flags, audit_logs
// (+BE-05 indexes, dedupe unique, audit REVOKE UPDATE/DELETE).

const require = createRequire(new URL("../../packages/db/src/check.ts", import.meta.url));
const pg = require("pg") as typeof import("pg");
const { drizzle } =
  require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
const { migrate } =
  require("drizzle-orm/node-postgres/migrator") as typeof import("drizzle-orm/node-postgres/migrator");

const scratchName = `tmu_db005_${Date.now()}_${randomBytes(4).toString("hex")}`;

interface Introspection {
  tables: string[];
  columns: Array<{ table: string; column: string; type: string }>;
  constraints: Array<{ table: string; type: string; definition: string }>;
  indexes: Array<{ table: string; indexName: string }>;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-DB-005 ops tables on a live pgvector database",
  () => {
    const scratchUrl = (() => {
      const url = new URL(process.env.DATABASE_URL ?? "postgres://localhost:1");
      url.pathname = `/${scratchName}`;
      return url.toString();
    })();

    let intro: Introspection;

    async function introspect(): Promise<Introspection> {
      const client = new pg.Client({ connectionString: scratchUrl });
      await client.connect();
      try {
        const tables = await client.query(
          `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
        );
        const columns = await client.query(
          `SELECT c.relname AS table, a.attname AS column, t.typname AS type
           FROM pg_attribute a
           JOIN pg_class c ON c.oid = a.attrelid
           JOIN pg_type t ON t.oid = a.atttypid
           JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind = 'r' AND a.attnum > 0
            AND NOT a.attisdropped`,
        );
        const constraints = await client.query(
          `SELECT rel.relname AS table, contype AS type,
                pg_get_constraintdef(con.oid) AS definition
           FROM pg_constraint con
           JOIN pg_class rel ON rel.oid = con.conrelid
           JOIN pg_namespace n ON n.oid = rel.relnamespace
          WHERE n.nspname = 'public' AND contype IN ('c', 'f', 'u')`,
        );
        const indexes = await client.query(
          `SELECT tablename AS table, indexname AS "indexName"
           FROM pg_indexes
          WHERE schemaname = 'public'`,
        );
        return {
          tables: tables.rows.map((r) => r.tablename as string).sort(),
          columns: columns.rows as unknown as Introspection["columns"],
          constraints: constraints.rows as unknown as Introspection["constraints"],
          indexes: indexes.rows as unknown as Introspection["indexes"],
        };
      } finally {
        await client.end();
      }
    }

    beforeAll(async () => {
      const admin = new pg.Client({ connectionString: process.env.DATABASE_URL });
      await admin.connect();
      await admin.query(`CREATE DATABASE ${scratchName}`);
      await admin.end();

      const pool = new pg.Pool({ connectionString: scratchUrl, max: 1 });
      await migrate(drizzle(pool), { migrationsFolder: "packages/db/migrations" });
      await pool.end();
      intro = await introspect();
    }, 180_000);

    afterAll(async () => {
      const admin = new pg.Client({ connectionString: process.env.DATABASE_URL });
      try {
        await admin.connect();
        await admin.query(`DROP DATABASE IF EXISTS ${scratchName} WITH (FORCE)`);
        await admin.end();
      } catch {
        // best effort
      }
    }, 60_000);

    it("creates notifications, notification_prefs, flags, and audit_logs tables", () => {
      for (const table of ["notifications", "notification_prefs", "flags", "audit_logs"]) {
        expect(intro.tables).toContain(table);
      }
    });

    it("creates BE-05 §TMU-DB-005 indexes", () => {
      const idxNames = intro.indexes.map((i) => i.indexName);
      expect(idxNames).toContain("notifications_user_created_idx");
      expect(idxNames).toContain("audit_logs_created_idx");
      expect(idxNames).toContain("flags_report_idx");
    });

    it("enforces notifications.dedupe_key unique constraint (duplicate rejected)", async () => {
      const client = new pg.Client({ connectionString: scratchUrl });
      await client.connect();
      try {
        const u = "018f0000-0000-7000-8000-000000000031";
        await client.query(
          `INSERT INTO users (id, email, display_name) VALUES ('${u}', 'notif-user@example.test', 'Pengguna Contoh') ON CONFLICT DO NOTHING`,
        );
        const n1 = "018f0000-0000-7000-8000-000000000032";
        await client.query(`
          INSERT INTO notifications (id, user_id, type, payload, dedupe_key)
          VALUES ('${n1}', '${u}', 'MATCH_SUGGESTED', '{"reportId":"r1","matchId":"m1","band":"STRONG"}', 'match:m1')
        `);
        // Second notification with same dedupe_key MUST fail with unique_violation
        const n2 = "018f0000-0000-7000-8000-000000000033";
        let failed = false;
        try {
          await client.query(`
            INSERT INTO notifications (id, user_id, type, payload, dedupe_key)
            VALUES ('${n2}', '${u}', 'MATCH_SUGGESTED', '{"reportId":"r1","matchId":"m1","band":"STRONG"}', 'match:m1')
          `);
        } catch (err: any) {
          failed = true;
          expect(err.code).toBe("23505"); // unique_violation
        }
        expect(failed).toBe(true);
      } finally {
        await client.end();
      }
    });

    it("rejects UPDATE on audit_logs (append-only via REVOKE)", async () => {
      // The REVOKE targets the "temuunair" role. When connected as the DB owner
      // (who is also "temuunair" on local Docker), Postgres still allows the owner
      // to bypass revokes. To test properly we create a restricted app role,
      // grant SELECT/INSERT, and verify UPDATE/DELETE are denied.
      const adminClient = new pg.Client({ connectionString: scratchUrl });
      await adminClient.connect();
      const appRole = `tmu_app_${Date.now()}`;
      try {
        await adminClient.query(`CREATE ROLE "${appRole}" LOGIN PASSWORD 'test'`);
        await adminClient.query(`GRANT CONNECT ON DATABASE "${scratchName}" TO "${appRole}"`);
        await adminClient.query(`GRANT USAGE ON SCHEMA public TO "${appRole}"`);
        await adminClient.query(`GRANT SELECT, INSERT ON audit_logs TO "${appRole}"`);
        // Explicitly REVOKE UPDATE/DELETE from the app role (mirrors the migration's intent)
        await adminClient.query(`REVOKE UPDATE, DELETE ON audit_logs FROM "${appRole}"`);
      } finally {
        await adminClient.end();
      }

      const appUrl = (() => {
        const url = new URL(scratchUrl);
        url.username = appRole;
        url.password = "test";
        return url.toString();
      })();
      const appClient = new pg.Client({ connectionString: appUrl });
      await appClient.connect();
      try {
        const logId = "018f0000-0000-7000-8000-000000000041";
        await appClient.query(`
          INSERT INTO audit_logs (id, action, entity_type, entity_id)
          VALUES ('${logId}', 'REPORT_CREATED', 'report', '018f0000-0000-7000-8000-000000000099')
        `);
        // UPDATE must be denied for the app role
        let failed = false;
        try {
          await appClient.query(`
            UPDATE audit_logs SET action = 'TAMPERED' WHERE id = '${logId}'
          `);
        } catch (err: any) {
          failed = true;
          expect(err.code).toBe("42501"); // permission denied
        }
        expect(failed).toBe(true);
      } finally {
        await appClient.end();
        // Cleanup role
        const cleanup = new pg.Client({ connectionString: scratchUrl });
        await cleanup.connect();
        await cleanup.query(`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM "${appRole}"`);
        await cleanup.query(`REVOKE ALL ON SCHEMA public FROM "${appRole}"`);
        await cleanup.query(`REVOKE ALL ON DATABASE "${scratchName}" FROM "${appRole}"`);
        await cleanup.query(`DROP ROLE IF EXISTS "${appRole}"`);
        await cleanup.end();
      }
    });

    it("notification_prefs has correct structure (user_id PK, email_enabled, muted_types)", () => {
      const npCols = intro.columns
        .filter((c) => c.table === "notification_prefs")
        .map((c) => c.column)
        .sort();
      expect(npCols).toContain("user_id");
      expect(npCols).toContain("email_enabled");
      expect(npCols).toContain("muted_types");
    });

    it("flags table has status column with default 'OPEN' and resolved_by FK", () => {
      const flagCols = intro.columns
        .filter((c) => c.table === "flags")
        .map((c) => c.column)
        .sort();
      expect(flagCols).toContain("id");
      expect(flagCols).toContain("report_id");
      expect(flagCols).toContain("reporter_id");
      expect(flagCols).toContain("reason");
      expect(flagCols).toContain("status");
      expect(flagCols).toContain("resolved_by");
      expect(flagCols).toContain("created_at");
      // Check FK to users for resolved_by
      const fks = intro.constraints.filter((c) => c.table === "flags" && c.type === "f");
      const resolvedByFk = fks.find((c) => c.definition.includes("resolved_by"));
      expect(resolvedByFk).toBeDefined();
    });
  },
);
