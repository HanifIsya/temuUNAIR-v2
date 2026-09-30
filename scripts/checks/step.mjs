#!/usr/bin/env node
// Gate step dispatcher (TMU-OPS-011).
//
// Root `package.json` scripts must not be edited by every package task: the ops lane owns this
// file. Instead each package gate step is routed here, and this dispatcher runs the real
// implementation when the owning package exists, otherwise the explicit exit-0 placeholder.
//
// Fail-closed: a failing package script propagates its non-zero exit (execSync throws); the
// placeholder is reachable only when the owning `package.json` is absent.
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// step name -> [package dir, workspace filter, package script]
export const ROUTES = {
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

// Pure decision function: what should run for this step?
// `exists` is injectable so tests can cover both branches without real packages.
export function planStep(step, exists = existsSync) {
  const route = ROUTES[step];
  if (!route) {
    throw new Error(`Unknown dispatched step: ${step ?? "(none given)"}`);
  }
  const [dir, filter, script] = route;
  if (!exists(`${dir}/package.json`)) {
    // Not implemented yet: the placeholder names the owning task and exits 0 (M0 exit criteria).
    return { kind: "pending", command: `node scripts/checks/pending.mjs ${step}` };
  }
  return { kind: "real", command: `pnpm --filter ${filter} run ${script}` };
}

// Runs the plan. `run` is injectable; the default propagates a non-zero child exit.
export function runStep(step, options = {}) {
  const { exists = existsSync, run = (cmd) => execSync(cmd, { stdio: "inherit" }) } = options;
  const plan = planStep(step, exists);
  run(plan.command);
  return plan;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  try {
    runStep(process.argv[2]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
