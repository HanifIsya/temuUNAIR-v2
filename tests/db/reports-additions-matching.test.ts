import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// TMU-DB-003 (red evidence): reports additions (needs_reprocess, FTS trigger) +
// matching tables (image_features, report_features with 3 HNSW indexes, matches).

const require = createRequire(new URL("../../packages/db/src/check.ts", import.meta.url));
const pg = require("pg") as typeof import("pg");
const { drizzle } =
  require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
const { migrate } =
  require("drizzle-orm/node-postgres/migrator") as typeof import("drizzle-orm/node-postgres/migrator");

const scratchName = `tmu_db003_${Date.now()}_${randomBytes(4).toString("hex")}`;

interface Introspection {
  tables: string[];
  columns: Array<{ table: string; column: string; type: string }>;
  enums: Array<{ name: string; values: string[] }>;
  triggers: Array<{ table: string; triggerName: string }>;
  indexes: Array<{ table: string; indexName: string }>;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-DB-003 reports additions + matching tables on a live pgvector database",
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
        const triggers = await client.query(
          `SELECT event_object_table AS table, trigger_name AS "triggerName"
           FROM information_schema.triggers
          WHERE trigger_schema = 'public'`,
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
          triggers: triggers.rows as unknown as Introspection["triggers"],
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

    it("adds needs_reprocess column to reports", () => {
      const col = intro.columns.find(
        (c) => c.table === "reports" && c.column === "needs_reprocess",
      );
      expect(col).toBeDefined();
      expect(col?.type).toBe("bool");
    });

    it("creates the reports_tsv_trg trigger on reports", () => {
      const trg = intro.triggers.find(
        (t) => t.table === "reports" && t.triggerName === "reports_tsv_trg",
      );
      expect(trg).toBeDefined();
    });

    it("verifies FTS trigger populates search_tsv on insert", async () => {
      const client = new pg.Client({ connectionString: scratchUrl });
      await client.connect();
      try {
        // Create user, location, and report to test trigger
        const userId = "018f0000-0000-7000-8000-000000000001";
        await client.query(
          `INSERT INTO users (id, email, display_name) VALUES ('${userId}', 'test@example.com', 'Tester')`,
        );
        const locId = "018f0000-0000-7000-8000-000000000002";
        await client.query(
          `INSERT INTO locations (id, campus, name, kind) VALUES ('${locId}', 'KAMPUS_A', 'Gedung A', 'BUILDING')`,
        );
        const repId = "018f0000-0000-7000-8000-000000000003";
        await client.query(`
        INSERT INTO reports (id, type, reporter_id, category, title, description, colors, brand, campus, location_id, occurred_from, expires_at)
        VALUES ('${repId}', 'LOST', '${userId}', 'ELECTRONICS', 'Dompet Cokelat', 'Hilang di kantin dekat pintu', '{"cokelat","hitam"}', 'Eiger', 'KAMPUS_A', '${locId}', now(), now() + interval '30 days')
      `);
        const res = await client.query(
          `SELECT search_tsv::text FROM reports WHERE id = '${repId}'`,
        );
        expect(res.rows[0].search_tsv).toBeDefined();
        expect(res.rows[0].search_tsv).toContain("dompet");
        expect(res.rows[0].search_tsv).toContain("cokelat");
        expect(res.rows[0].search_tsv).toContain("eiger");
      } finally {
        await client.end();
      }
    });

    it("creates image_features, report_features, and matches tables", () => {
      for (const table of ["image_features", "report_features", "matches"]) {
        expect(intro.tables).toContain(table);
      }
    });

    it("declares match_state enum matching BE-05", () => {
      const byName = new Map(intro.enums.map((e) => [e.name, e.values]));
      expect(byName.get("match_state")).toEqual([
        "SUGGESTED",
        "DISMISSED",
        "CLAIMED",
        "INVALIDATED",
      ]);
    });

    it("creates HNSW vector indexes on report_features", () => {
      const idxNames = intro.indexes
        .filter((i) => i.table === "report_features")
        .map((i) => i.indexName);
      expect(idxNames).toContain("report_features_img_hnsw");
      expect(idxNames).toContain("report_features_txt_hnsw");
      expect(idxNames).toContain("report_features_sent_hnsw");
    });
  },
);
