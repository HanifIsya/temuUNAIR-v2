#!/usr/bin/env node
// Deterministic task scheduler (Blueprint §7.6). Reads task front-matter and prints the
// next runnable task. No model involved.
//
// Usage:
//   node scripts/next-task.mjs [--lane be] [--milestone M3] [--check-remote] [--all]
//   node scripts/next-task.mjs --show TMU-BE-010 --field lane|slug|status|deps
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const TASKS_DIR = "docs/08-project/tasks";

const args = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);

function parseFrontMatter(file) {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    let [, key, value] = kv;
    value = value.replace(/\s+#.*$/, "").trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      fm[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      fm[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return fm;
}

function loadTasks() {
  let files = [];
  try {
    files = readdirSync(TASKS_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  return files
    .map((f) => {
      const fm = parseFrontMatter(join(TASKS_DIR, f));
      if (!fm || !fm.id) return null;
      return { ...fm, file: join(TASKS_DIR, f) };
    })
    .filter(Boolean);
}

function remoteBranches() {
  if (!flag("check-remote")) return [];
  try {
    return execSync("git ls-remote --heads origin", { encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.split("refs/heads/")[1])
      .filter(Boolean);
  } catch {
    return [];
  }
}

const tasks = loadTasks();

if (args.includes("--show")) {
  const id = opt("show");
  const t = tasks.find((x) => x.id === id);
  if (!t) {
    console.error(`Task ${id} not found`);
    process.exit(1);
  }
  const field = opt("field");
  console.log(
    field
      ? Array.isArray(t[field])
        ? t[field].join(",")
        : (t[field] ?? "")
      : JSON.stringify(t, null, 2),
  );
  process.exit(0);
}

if (flag("all")) {
  for (const t of tasks)
    console.log(`${t.id}\t${t.status}\t${t.lane}\t${t.milestone ?? ""}\t${t.title ?? ""}`);
  process.exit(0);
}

const done = new Set(tasks.filter((t) => t.status === "DONE").map((t) => t.id));
const branches = remoteBranches();
const laneFilter = opt("lane");
const msFilter = opt("milestone");

const runnable = tasks
  .filter((t) => t.status === "TODO")
  .filter((t) => (laneFilter ? t.lane === laneFilter : true))
  .filter((t) => (msFilter ? t.milestone === msFilter : true))
  .filter((t) => (t.deps ?? []).every((d) => done.has(d)))
  .filter((t) => !branches.some((b) => new RegExp(`agent/[a-z]+/${t.id}-`).test(b)))
  .filter((t) => {
    // one migration PR at a time (Blueprint §7.3)
    if (t.lane !== "db") return true;
    return !branches.some((b) => b.startsWith("agent/db/"));
  })
  .sort(
    (a, b) =>
      (a.milestone ?? "").localeCompare(b.milestone ?? "") ||
      (a.priority ?? "P2").localeCompare(b.priority ?? "P2") ||
      a.id.localeCompare(b.id),
  );

if (runnable.length === 0) {
  console.error("No runnable task");
  process.exit(1);
}
console.log(runnable[0].id);
