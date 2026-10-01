import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));

describe("packages/db manifest", () => {
  it("exists and is named @temuunair/db", () => {
    expect(existsSync("packages/db/package.json")).toBe(true);
    const pkg = readJson("packages/db/package.json");
    expect(pkg.name).toBe("@temuunair/db");
    expect(pkg.private).toBe(true);
    expect(pkg.type).toBe("module");
  });

  it("declares the four dispatcher scripts", () => {
    const pkg = readJson("packages/db/package.json");
    for (const script of ["check", "generate", "migrate", "seed"]) {
      expect(typeof pkg.scripts?.[script]).toBe("string");
      expect(pkg.scripts[script]).toBeTruthy();
    }
    expect(pkg.scripts.check).toMatch(/tsx|node/);
  });
});

describe("baseline migration (BE-05)", () => {
  it("ships 0001_init.sql named NNNN_description.sql", () => {
    expect(existsSync("packages/db/migrations")).toBe(true);
    const files = readdirSync("packages/db/migrations");
    expect(files.some((file) => /^\d{4}_[a-z0-9_]+\.sql$/.test(file))).toBe(true);
    expect(files).toContain("0001_init.sql");
  });

  it("has a rollback note and creates only the two extensions", () => {
    const sql = readFileSync("packages/db/migrations/0001_init.sql", "utf8");
    expect(sql).toMatch(/^--.*rollback/im);
    expect(sql).toContain("CREATE EXTENSION IF NOT EXISTS vector");
    expect(sql).toContain("CREATE EXTENSION IF NOT EXISTS citext");
    expect(sql).not.toMatch(/CREATE\s+TABLE|CREATE\s+INDEX|ALTER\s+TABLE/i);
  });

  it("has a drizzle journal referencing 0001_init", () => {
    const journal = readJson("packages/db/migrations/meta/_journal.json");
    expect(journal.dialect).toBe("postgresql");
    expect(journal.entries.map((entry: { tag: string }) => entry.tag)).toContain("0001_init");
  });
});

describe("db README", () => {
  it("documents generate, migrate and check", () => {
    const readme = readFileSync("packages/db/README.md", "utf8");
    expect(readme).toContain("db:generate");
    expect(readme).toContain("db:migrate");
    expect(readme).toContain("db:check");
  });
});
