#!/usr/bin/env node
// Gate step dispatcher (TMU-OPS-011).
//
// Root `package.json` scripts must not be edited by every package task: the ops lane owns this
// file. Instead each package gate step is routed here, and this dispatcher runs the real
// implementation when the owning package exists, otherwise the explicit exit-0 placeholder.
//
// Adding a real step later (e.g. packages/contracts/src/cli.ts) requires no root-file change:
// the package ships `pnpm --filter <pkg> <script>` and this dispatcher finds it.
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

// step name -> [package dir, workspace filter, package script]
const ROUTES = {
  "contracts:build": ["packages/contracts", "@temuunair/contracts", "build"],
  "contracts:check": ["packages/contracts", "@temuunair/contracts", "check"],
  "contracts:lint": ["packages/contracts", "@temuunair/contracts", "lint"],
  "contracts:breaking": ["packages/contracts", "@temuunair/contracts", "breaking"],
  "db:check": ["packages/db", "@temuunair/db", "check"],
  "db:generate": ["packages/db", "@temuunair/db", "generate"],
  "db:migrate": ["packages/db", "@temuunair/db", "migrate"],
  seed: ["packages/db", "@temuunair/db", "seed"],
  "test:integration": ["tests/integration", "@temuunair/integration-tests", "test"],
  "test:contract": ["tests/contract", "@temuunair/contract-tests", "test"],
  "test:e2e": ["tests/e2e", "@temuunair/e2e-tests", "test"],
};

const step = process.argv[2];
const route = ROUTES[step];

if (!route) {
  console.error(`Unknown dispatched step: ${step ?? "(none given)"}`);
  process.exit(1);
}

const [dir, filter, script] = route;

if (!existsSync(`${dir}/package.json`)) {
  // Not implemented yet: the placeholder names the owning task and exits 0 (M0 exit criteria).
  execSync(`node scripts/checks/pending.mjs ${step}`, { stdio: "inherit" });
  process.exit(0);
}

execSync(`pnpm --filter ${filter} run ${script}`, { stdio: "inherit" });
