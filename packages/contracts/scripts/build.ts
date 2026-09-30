#!/usr/bin/env node
// `contracts:build` (TMU-OPS-004): regenerate the four derived artefacts. The generator is the
// only writer (docs/04-contracts/README.md governance); this script adds filesystem I/O only.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateAll } from "../src/generate.ts";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const version = readFileSync(join(repoRoot, "docs/04-contracts/CONTRACT_VERSION"), "utf8").trim();

for (const file of generateAll(version)) {
  const target = join(repoRoot, file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, file.content, "utf8");
  process.stdout.write(`written ${file.path}\n`);
}

process.stdout.write(`contract version: ${version}\n`);
