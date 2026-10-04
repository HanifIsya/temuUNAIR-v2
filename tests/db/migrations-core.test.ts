import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// TMU-DB-001 (red evidence): the core-tables migration must land users (with the BE-05
// enum/constraint shape), the Auth.js adapter tables, locations (self-referencing) and
// drop_points. Scratch database lifecycle mirrors packages/db/src/check-worker.ts; pg and
// drizzle resolve from packages/db like they do in src/check.ts (createRequire anchor).

const require = createRequire(new URL("../../packages/db/src/check.ts", import.meta.url));
const pg = require("pg") as typeof import("pg");
const { drizzle } =
  require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
const { migrate } =
  require("drizzle-orm/node-postgres/migrator") as typeof import("drizzle-orm/node-postgres/migrator");

const scratchName = `tmu_db001_${Date.now()}_${randomBytes(4).toString("hex")}`;

interface Introspection {
  tables: string[];
  columns: Array<{ table: string; column: string; type: string }>;
  enums: Array<{ name: string; values: string[] }>;
  constraints: Array<{ table: string; type: string; definition: string }>;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-DB-001 core tables on a live pgvector database",
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
        return {
          tables: tables.rows.map((r) => r.tablename as string).sort(),
          columns: columns.rows as unknown as Introspection["columns"],
          enums: enums.rows.map((r) => ({ name: r.name as string, values: r.values as string[] })),
          constraints: constraints.rows as unknown as Introspection["constraints"],
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
        // best effort: a leftover scratch database must never fail the suite
      }
    }, 60_000);

    it("creates the core tables including the Auth.js adapter tables", () => {
      for (const table of [
        "users",
        "accounts",
        "sessions",
        "verification_tokens",
        "locations",
        "drop_points",
      ]) {
        expect(intro.tables).toContain(table);
      }
    });

    it("declares the user_role and campus enums exactly as BE-05", () => {
      const byName = new Map(intro.enums.map((e) => [e.name, e.values]));
      expect(byName.get("user_role")).toEqual(["USER", "MODERATOR", "ADMIN"]);
      expect(byName.get("campus")).toEqual(["KAMPUS_A", "KAMPUS_B", "KAMPUS_C", "BANYUWANGI"]);
    });

    it("types users.email as citext and enforces the BE-05 users shape", () => {
      const col = (table: string, column: string) =>
        intro.columns.find((c) => c.table === table && c.column === column);
      expect(col("users", "email")?.type).toBe("citext");
      expect(col("users", "role")?.type).toBe("user_role");
      expect(col("users", "moderator_campus")?.type).toBe("campus");
      expect(intro.columns.filter((c) => c.table === "users").map((c) => c.column)).toEqual(
        expect.arrayContaining([
          "id",
          "display_name",
          "unair_ref",
          "locale",
          "status",
          "last_login_at",
          "created_at",
          "updated_at",
        ]),
      );
      expect(
        intro.constraints.some(
          (k) => k.table === "users" && k.type === "c" && k.definition.includes("ACTIVE"),
        ),
      ).toBe(true);
      expect(
        intro.constraints.some(
          (k) => k.table === "users" && k.type === "u" && k.definition.includes("email"),
        ),
      ).toBe(true);
    });

    it("self-references locations and gives drop_points a jsonb hours column", () => {
      const col = (table: string, column: string) =>
        intro.columns.find((c) => c.table === table && c.column === column);
      expect(col("locations", "parent_id")?.type).toBe("uuid");
      expect(
        intro.constraints.some(
          (k) => k.table === "locations" && k.type === "f" && k.definition.includes("parent_id"),
        ),
      ).toBe(true);
      expect(col("drop_points", "hours")?.type).toBe("jsonb");
      expect(
        intro.constraints.some(
          (k) =>
            k.table === "drop_points" && k.type === "f" && k.definition.includes("location_id"),
        ),
      ).toBe(true);
    });

    it("keys the adapter tables at the users table", () => {
      for (const table of ["accounts", "sessions"]) {
        expect(
          intro.constraints.some(
            (k) => k.table === table && k.type === "f" && k.definition.includes("user_id"),
          ),
        ).toBe(true);
      }
    });
  },
);
