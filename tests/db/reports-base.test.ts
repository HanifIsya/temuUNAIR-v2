import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// TMU-DB-002 (red evidence): the reports base migration must land reports (with the BE-05
// custody CHECK and base indexes), report_images (cascade FK to reports) and verification_hints
// (answer_enc bytea, cascade FK to reports). needs_reprocess is explicitly deferred to TMU-DB-003.

const require = createRequire(new URL("../../packages/db/src/check.ts", import.meta.url));
const pg = require("pg") as typeof import("pg");
const { drizzle } =
  require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
const { migrate } =
  require("drizzle-orm/node-postgres/migrator") as typeof import("drizzle-orm/node-postgres/migrator");

const scratchName = `tmu_db002_${Date.now()}_${randomBytes(4).toString("hex")}`;

interface Introspection {
  tables: string[];
  columns: Array<{ table: string; column: string; type: string }>;
  enums: Array<{ name: string; values: string[] }>;
  constraints: Array<{ table: string; type: string; definition: string }>;
  indexes: Array<{ table: string; indexName: string }>;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-DB-002 reports base tables on a live pgvector database",
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

    it("creates the reports, report_images, and verification_hints tables", () => {
      for (const table of ["reports", "report_images", "verification_hints"]) {
        expect(intro.tables).toContain(table);
      }
    });

    it("declares report_type and report_status enums matching BE-05 exactly", () => {
      const byName = new Map(intro.enums.map((e) => [e.name, e.values]));
      expect(byName.get("report_type")).toEqual(["LOST", "FOUND"]);
      expect(byName.get("report_status")).toEqual([
        "PENDING_REVIEW",
        "OPEN",
        "MATCHED",
        "IN_VERIFICATION",
        "RETURNED",
        "EXPIRED",
        "CANCELLED",
        "REMOVED",
      ]);
    });

    it("enforces the FOUND-custody CHECK constraint and base columns on reports", () => {
      const cols = intro.columns.filter((c) => c.table === "reports").map((c) => c.column);
      expect(cols).toEqual(
        expect.arrayContaining([
          "id",
          "type",
          "status",
          "reporter_id",
          "category",
          "is_sensitive",
          "title",
          "description",
          "colors",
          "brand",
          "campus",
          "location_id",
          "location_note",
          "lat",
          "lng",
          "occurred_from",
          "occurred_to",
          "custody",
          "drop_point_id",
          "expires_at",
          "resolved_at",
          "search_tsv",
          "version",
          "created_at",
          "updated_at",
        ]),
      );

      // CHECK ((type = 'FOUND') = (custody IS NOT NULL))
      expect(
        intro.constraints.some(
          (k) =>
            k.table === "reports" &&
            k.type === "c" &&
            k.definition.includes("FOUND") &&
            k.definition.includes("custody"),
        ),
      ).toBe(true);
    });

    it("creates the base indexes for reports", () => {
      const idxNames = intro.indexes.filter((i) => i.table === "reports").map((i) => i.indexName);
      expect(idxNames).toContain("reports_browse_idx");
      expect(idxNames).toContain("reports_reporter_idx");
      expect(idxNames).toContain("reports_tsv_idx");
      expect(idxNames).toContain("reports_expiry_idx");
    });

    it("cascades delete from reports to report_images and verification_hints", () => {
      for (const table of ["report_images", "verification_hints"]) {
        expect(
          intro.constraints.some(
            (k) =>
              k.table === table &&
              k.type === "f" &&
              k.definition.includes("CASCADE") &&
              k.definition.includes("report_id"),
          ),
        ).toBe(true);
      }
    });

    it("types verification_hints.answer_enc as bytea", () => {
      const col = intro.columns.find(
        (c) => c.table === "verification_hints" && c.column === "answer_enc",
      );
      expect(col?.type).toBe("bytea");
    });
  },
);
