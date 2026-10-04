import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// TMU-DB-004 (red evidence): claims, claim_answers, messages (+BE-05 indexes, partial uniques, checks).

const require = createRequire(new URL("../../packages/db/src/check.ts", import.meta.url));
const pg = require("pg") as typeof import("pg");
const { drizzle } =
  require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
const { migrate } =
  require("drizzle-orm/node-postgres/migrator") as typeof import("drizzle-orm/node-postgres/migrator");

const scratchName = `tmu_db004_${Date.now()}_${randomBytes(4).toString("hex")}`;

interface Introspection {
  tables: string[];
  columns: Array<{ table: string; column: string; type: string }>;
  enums: Array<{ name: string; values: string[] }>;
  constraints: Array<{ table: string; type: string; definition: string }>;
  indexes: Array<{ table: string; indexName: string }>;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-DB-004 claims and chat tables on a live pgvector database",
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
        const enums = await client.query(
          `SELECT t.typname AS name, array_agg(e.enumlabel::text ORDER BY e.enumsortorder) AS values
           FROM pg_type t
           JOIN pg_enum e ON e.enumtypid = t.oid
           JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public'
          GROUP BY t.typname`,
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
          enums: enums.rows.map((r) => ({ name: r.name as string, values: r.values as string[] })),
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

    it("creates claims, claim_answers, and messages tables", () => {
      for (const table of ["claims", "claim_answers", "messages"]) {
        expect(intro.tables).toContain(table);
      }
    });

    it("declares claim_status enum matching BE-05 exactly", () => {
      const byName = new Map(intro.enums.map((e) => [e.name, e.values]));
      expect(byName.get("claim_status")).toEqual([
        "SUBMITTED",
        "APPROVED",
        "REJECTED",
        "DISPUTED",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ]);
    });

    it("creates indexes on claims and messages", () => {
      const idxNames = intro.indexes.map((i) => i.indexName);
      expect(idxNames).toContain("claims_one_active_per_claimant");
      expect(idxNames).toContain("claims_one_approved_per_report");
      expect(idxNames).toContain("claims_status_idx");
      expect(idxNames).toContain("messages_claim_created_idx");
    });

    it("enforces second active claim per claimant on same report is rejected", async () => {
      const client = new pg.Client({ connectionString: scratchUrl });
      await client.connect();
      try {
        const u1 = "018f0000-0000-7000-8000-000000000011";
        const u2 = "018f0000-0000-7000-8000-000000000012";
        await client.query(
          `INSERT INTO users (id, email, display_name) VALUES ('${u1}', 'finder@example.com', 'Finder'), ('${u2}', 'claimant@example.com', 'Claimant')`,
        );
        const loc = "018f0000-0000-7000-8000-000000000013";
        await client.query(
          `INSERT INTO locations (id, campus, name, kind) VALUES ('${loc}', 'KAMPUS_B', 'Perpus', 'LIBRARY')`,
        );
        const rep = "018f0000-0000-7000-8000-000000000014";
        await client.query(`
        INSERT INTO reports (id, type, reporter_id, category, title, description, campus, location_id, occurred_from, expires_at)
        VALUES ('${rep}', 'LOST', '${u1}', 'BAG', 'Tas Hitam', 'Ketinggalan di perpus', 'KAMPUS_B', '${loc}', now(), now() + interval '30 days')
      `);
        const c1 = "018f0000-0000-7000-8000-000000000015";
        await client.query(`
        INSERT INTO claims (id, found_report_id, claimant_id, status, expires_at)
        VALUES ('${c1}', '${rep}', '${u2}', 'SUBMITTED', now() + interval '7 days')
      `);
        // Second active claim by same claimant on same report MUST fail with unique violation
        const c2 = "018f0000-0000-7000-8000-000000000016";
        let failed = false;
        try {
          await client.query(`
          INSERT INTO claims (id, found_report_id, claimant_id, status, expires_at)
          VALUES ('${c2}', '${rep}', '${u2}', 'SUBMITTED', now() + interval '7 days')
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

    it("enforces message body length check <= 1000 characters", async () => {
      const client = new pg.Client({ connectionString: scratchUrl });
      await client.connect();
      try {
        const u = "018f0000-0000-7000-8000-000000000021";
        await client.query(
          `INSERT INTO users (id, email, display_name) VALUES ('${u}', 'u@example.com', 'User') ON CONFLICT DO NOTHING`,
        );
        const loc = "018f0000-0000-7000-8000-000000000022";
        await client.query(
          `INSERT INTO locations (id, campus, name, kind) VALUES ('${loc}', 'KAMPUS_C', 'Gedung C', 'BUILDING') ON CONFLICT DO NOTHING`,
        );
        const rep = "018f0000-0000-7000-8000-000000000023";
        await client.query(`
        INSERT INTO reports (id, type, reporter_id, category, title, description, campus, location_id, occurred_from, expires_at)
        VALUES ('${rep}', 'LOST', '${u}', 'KEYS', 'Kunci Motor', 'Jatuh', 'KAMPUS_C', '${loc}', now(), now() + interval '30 days')
      `);
        const clm = "018f0000-0000-7000-8000-000000000024";
        await client.query(`
        INSERT INTO claims (id, found_report_id, claimant_id, status, expires_at)
        VALUES ('${clm}', '${rep}', '${u}', 'APPROVED', now() + interval '7 days')
      `);
        const msgId = "018f0000-0000-7000-8000-000000000025";
        const oversized = "a".repeat(1001);
        let failed = false;
        try {
          await client.query(`
          INSERT INTO messages (id, claim_id, sender_id, body)
          VALUES ('${msgId}', '${clm}', '${u}', '${oversized}')
        `);
        } catch (err: any) {
          failed = true;
          expect(err.code).toBe("23514"); // check_violation
        }
        expect(failed).toBe(true);
      } finally {
        await client.end();
      }
    });
  },
);
