#!/usr/bin/env node
// `contracts:breaking` (TMU-OPS-004): compare the current generated contract against the last
// released baseline. Baseline precedence: CONTRACTS_BASELINE_DIR (test/red-evidence hook), then
// `origin/main` via git. No baseline yet is not a failure (BE-02 versioning).
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { classifyBreaking } from "../src/breaking.ts";
import { generateAll } from "../src/generate.ts";

const OPENAPI_PATH = "docs/04-contracts/backend/BE-02-openapi.yaml";
const VERSION_PATH = "docs/04-contracts/CONTRACT_VERSION";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const currentVersion = readFileSync(join(repoRoot, VERSION_PATH), "utf8").trim();
const currentYaml = generateAll(currentVersion).find((file) => file.path === OPENAPI_PATH);
if (currentYaml === undefined) {
  process.stderr.write(`contracts:breaking failed: generator did not emit ${OPENAPI_PATH}\n`);
  process.exit(1);
}

const readBaselineFromDir = (dir: string): { yaml: string; version: string } | null => {
  const yamlPath = join(dir, "BE-02-openapi.yaml");
  const versionPath = join(dir, "CONTRACT_VERSION");
  if (!existsSync(yamlPath) || !existsSync(versionPath)) return null;
  return {
    yaml: readFileSync(yamlPath, "utf8"),
    version: readFileSync(versionPath, "utf8").trim(),
  };
};

const readBaselineFromGit = (): { yaml: string; version: string } | null => {
  try {
    const yaml = execSync(`git show origin/main:${OPENAPI_PATH}`, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const version = execSync(`git show origin/main:${VERSION_PATH}`, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return { yaml, version: version.trim() };
  } catch {
    return null;
  }
};

const baselineDir = process.env["CONTRACTS_BASELINE_DIR"];
const baseline =
  baselineDir !== undefined && baselineDir.length > 0
    ? readBaselineFromDir(baselineDir)
    : readBaselineFromGit();

if (baseline === null) {
  process.stdout.write("no baseline released yet\n");
  process.exit(0);
}

const findings = classifyBreaking(parse(baseline.yaml), parse(currentYaml.content), {
  baselineVersion: baseline.version,
  currentVersion,
});

for (const finding of findings) {
  process.stderr.write(`${finding.rule} ${finding.path}: ${finding.message}\n`);
}

if (findings.length > 0) {
  process.stderr.write(
    `contracts:breaking failed: ${findings.length} breaking finding(s) vs ${baseline.version}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write(`contracts:breaking OK (baseline ${baseline.version})\n`);
}
