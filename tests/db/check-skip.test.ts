import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const run = () => {
  const env = { ...process.env };
  delete env.DATABASE_URL;
  return spawnSync(process.execPath, ["scripts/checks/step.mjs", "db:check"], {
    cwd: process.cwd(),
    env,
    encoding: "utf8",
    timeout: 120000,
  });
};

describe("db:check without DATABASE_URL", () => {
  it("exits 0 with a named skip notice instead of silently passing", () => {
    const res = run();
    expect(res.status, res.stdout + res.stderr).toBe(0);
    expect(res.stdout).toMatch(/db:check/);
    expect(res.stdout).toMatch(/skip/i);
    expect(res.stdout).toMatch(/DATABASE_URL/);
    expect(res.stderr).not.toMatch(/Error/i);
  });
});
