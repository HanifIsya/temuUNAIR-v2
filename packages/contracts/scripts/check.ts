#!/usr/bin/env node
// `contracts:check` (TMU-OPS-004): rebuild in memory and diff against the committed files.
// Fails on drift, missing files or hand edits (docs/04-contracts/README.md governance).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { diffGenerated } from "../src/check.ts";
import { generateAll } from "../src/generate.ts";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const version = readFileSync(join(repoRoot, "docs/04-contracts/CONTRACT_VERSION"), "utf8").trim();

const read = (path: string): string | null => {
  try {
    return readFileSync(join(repoRoot, path), "utf8");
  } catch {
    return null;
  }
};

const drifts = diffGenerated(generateAll(version), read);
for (const drift of drifts) {
  process.stderr.write(`drift ${drift.path}: ${drift.reason}\n`);
}

if (drifts.length > 0) {
  process.stderr.write(
    `contracts:check failed: ${drifts.length} file(s) out of sync. Run \`pnpm contracts:build\`.\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write(`contracts:check OK (version ${version})\n`);
}
