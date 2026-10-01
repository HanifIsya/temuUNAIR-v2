import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function makeMigrationsDir(sql: string): string {
  const dir = mkdtempSync(join(tmpdir(), "temuunair-db-"));
  mkdirSync(join(dir, "meta"), { recursive: true });
  writeFileSync(
    join(dir, "meta", "_journal.json"),
    JSON.stringify(
      {
        version: "7",
        dialect: "postgresql",
        entries: [{ idx: 1, version: "7", when: Date.now(), tag: "0001_test", breakpoints: true }],
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(join(dir, "0001_test.sql"), sql);
  return dir;
}

describe.skipIf(!process.env.DATABASE_URL)("db:check against a live pgvector database", () => {
  it("exits 0 for the real migrations on an empty database", () => {
    const res = spawnSync(process.execPath, ["scripts/checks/step.mjs", "db:check"], {
      cwd: process.cwd(),
      env: { ...process.env },
      encoding: "utf8",
      timeout: 180000,
    });
    expect(res.status, res.stdout + res.stderr).toBe(0);
  });

  it("exits non-zero for a syntactically broken migration", async () => {
    const dir = makeMigrationsDir("CREATE TABLE broken (;\n");
    try {
      const { runCheck } = await import("../../packages/db/src/check.ts");
      const code = await runCheck(
        { databaseUrl: process.env.DATABASE_URL, migrationsDir: dir },
        { log: () => {}, error: () => {} },
      );
      expect(code).not.toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("exits non-zero when the applied schema drifts from the Drizzle schema", async () => {
    const dir = makeMigrationsDir("CREATE TABLE stray (id integer PRIMARY KEY);\n");
    try {
      const { runCheck } = await import("../../packages/db/src/check.ts");
      const code = await runCheck(
        { databaseUrl: process.env.DATABASE_URL, migrationsDir: dir },
        { log: () => {}, error: () => {} },
      );
      expect(code).not.toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
