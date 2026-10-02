// Repo scaffold invariants (TMU-OPS-001).
//
// These tests guard the M0 bootstrap itself: the gate must only call scripts that exist, and the
// lane map must stay non-overlapping. Both are cheap to check here and expensive to debug later
// (a gate step pointing at a missing script makes every task fail at step 7 of the loop).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

describe("gate wiring", () => {
  it("defines every pnpm script that scripts/gate.sh invokes", () => {
    const gate = readFileSync("scripts/gate.sh", "utf8");
    const pkg = readJson("package.json");

    // `pnpm -s <name>` and `pnpm -s run <name>` both address a package.json script; the `run`
    // keyword is optional and must not be mistaken for the script name.
    const invoked = [...gate.matchAll(/pnpm -s (?:run )?([\w:-]+)/g)].map((m) => m[1]);
    expect(invoked.length).toBeGreaterThan(0);

    // `pnpm audit` / `pnpm add` style built-ins have no package.json script and are not errors.
    const BUILTINS = new Set(["audit", "add", "remove", "install", "exec", "dlx"]);
    const missing = [...new Set(invoked)].filter(
      (name) => !(name in pkg.scripts) && !BUILTINS.has(name),
    );
    expect(missing).toEqual([]);
  });

  it("exposes gate, gate:quick and gate:full as the documented entry points", () => {
    const pkg = readJson("package.json");
    for (const name of ["gate", "gate:quick", "gate:full"]) {
      expect(pkg.scripts[name]).toContain("scripts/gate.sh");
    }
  });

  it("only skips the ML gate step when the ML package is absent", () => {
    const gate = readFileSync("scripts/gate.sh", "utf8");
    expect(gate).toContain("services/ml/pyproject.toml");
  });

  it("lets pnpm/action-setup read the version from packageManager alone", () => {
    // Setting `version:` on the action while package.json declares `packageManager` makes the
    // action fail with "Multiple versions of pnpm specified", so the pin lives in one place.
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    const withVersion = [...ci.matchAll(/action-setup@v4\s*\n\s*with:/g)];
    expect(withVersion, "action-setup must not pass an explicit version").toEqual([]);
    expect(ci).not.toContain("PNPM_VERSION");
  });

  it("skips the ML and e2e CI jobs until their packages exist", () => {
    // Both jobs used to fail on a fresh clone because services/ml and tests/e2e do not exist yet.
    // The e2e job must skip until tests/e2e (TMU-OPS-013) exists — the old apps/web guard flipped
    // the job on before a shell/scenarios could run, and the workspace root does not depend on
    // `playwright`, so a root-level `pnpm exec playwright` cannot resolve the binary.
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    expect(ci).toContain("services/ml/pyproject.toml");
    expect(ci).toContain("tests/e2e/package.json");
  });

  it("routes the CI audit job through the same script as the gate", () => {
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    expect(ci).toContain("pnpm -s run audit");
    expect(ci).not.toMatch(/pnpm -s audit --prod/);
  });
});

describe("lane map", () => {
  const lanes = readJson(".agent/lanes.json");
  const laneNames = Object.keys(lanes).filter((k) => k !== "_common");

  const globToRe = (g) => {
    // Same translation as scripts/check-lane.sh: ** spans directories, * stays within one.
    const sentinel = String.fromCharCode(0);
    return new RegExp(
      "^" +
        g
          .replace(/[.+^${}()|[\]\\]/g, "\\$&")
          .replace(/\*\*/g, sentinel)
          .replace(/\*/g, "[^/]*")
          .split(sentinel)
          .join(".*") +
        "$",
    );
  };

  it("declares the eleven lanes from docs/05-workflow/10-parallel-lanes-and-ownership.md", () => {
    expect(laneNames.sort()).toEqual(
      ["arch", "be", "contracts", "db", "docs", "fe", "meta", "ml", "ops", "qa", "sec"].sort(),
    );
  });

  it("covers the workspace scaffold this task adds", () => {
    const scaffold = [
      "package.json",
      "pnpm-workspace.yaml",
      "turbo.json",
      "tsconfig.json",
      "tsconfig.base.json",
      ".npmrc",
      ".prettierrc.json",
      ".prettierignore",
      "eslint.config.mjs",
      "vitest.config.ts",
      ".agent/lanes.json",
      "scripts/gate.sh",
      "scripts/checks/pending.mjs",
      "docs/08-project/backlog.md",
      "docs/08-project/status.md",
      "docs/08-project/tasks/TMU-OPS-001.md",
    ];
    const allowed = [...(lanes.ops ?? []), ...lanes._common].map(globToRe);
    const uncovered = scaffold.filter((f) => !allowed.some((re) => re.test(f)));
    expect(uncovered).toEqual([]);
  });

  it("gives the docs lane the whole source folder (TMU-OPS-033)", () => {
    const sourcePaths = [
      "docs/_source/proposal.pdf",
      "docs/_source/proposal-extract.md",
      "docs/_source/README.md",
      "docs/_source/logo.png",
    ];
    const allowed = [...(lanes.docs ?? []), ...lanes._common].map(globToRe);
    const uncovered = sourcePaths.filter((f) => !allowed.some((re) => re.test(f)));
    expect(uncovered).toEqual([]);
  });

  it("keeps contract paths out of every non-contract lane", () => {
    const contractPaths = [
      "packages/contracts/src/index.ts",
      "docs/04-contracts/backend/BE-03-endpoint-catalog.md",
    ];
    // `meta` is the one documented exception: Blueprint §7.5 grants it
    // docs/04-contracts/CHANGELOG.md so the docs-keeper can log accepted contract changes.
    // Everything else under docs/04-contracts/** stays with the contracts lane.
    const allowedExceptions = ["docs/04-contracts/CHANGELOG.md"];
    for (const lane of laneNames) {
      if (lane === "contracts" || lane === "meta") continue;
      const allowed = [...(lanes[lane] ?? []), ...lanes._common].map(globToRe);
      const leaked = contractPaths.filter(
        (f) => !allowedExceptions.includes(f) && allowed.some((re) => re.test(f)),
      );
      expect(leaked, `lane ${lane} must not own contract paths`).toEqual([]);
    }
  });

  it("keeps the meta lane's contract exception limited to the changelog", () => {
    const allowed = [...(lanes.meta ?? []), ...lanes._common].map(globToRe);
    const reachable = [
      "docs/04-contracts/CHANGELOG.md",
      "docs/04-contracts/backend/BE-03-endpoint-catalog.md",
      "docs/04-contracts/CONTRACT_VERSION",
      "packages/contracts/src/index.ts",
    ].filter((f) => allowed.some((re) => re.test(f)));
    expect(reachable).toEqual(["docs/04-contracts/CHANGELOG.md"]);
  });

  it("keeps db migration paths exclusive to the db lane", () => {
    const migration = "packages/db/migrations/0001_init.sql";
    for (const lane of laneNames) {
      if (lane === "db") continue;
      const allowed = [...(lanes[lane] ?? []), ...lanes._common].map(globToRe);
      expect(
        allowed.some((re) => re.test(migration)),
        `lane ${lane}`,
      ).toBe(false);
    }
  });
});

describe("task backlog", () => {
  const taskDir = "docs/08-project/tasks";

  it("gives every M0 task file the front-matter the scheduler requires", () => {
    const required = ["id", "title", "status", "lane", "slug", "milestone", "priority", "deps"];
    const files = readdirSync(taskDir).filter((f) => f.endsWith(".md"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const text = readFileSync(`${taskDir}/${file}`, "utf8");
      const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      expect(block, `${file} has front-matter`).not.toBeNull();

      const keys = block[1]
        .split(/\r?\n/)
        .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*):/)?.[1])
        .filter(Boolean);
      for (const key of required) {
        expect(keys, `${file} declares ${key}`).toContain(key);
      }
      expect(block[1]).toMatch(/^deps: \[.*\]$/m);
    }
  });

  it("keeps task ids unique and matching their filenames", () => {
    const files = readdirSync(taskDir).filter((f) => f.endsWith(".md"));
    const ids = files.map((f) => ({
      file: f,
      id: readFileSync(`${taskDir}/${f}`, "utf8").match(/^id: (TMU-[A-Z]+-\d+)$/m)?.[1],
    }));

    expect(
      ids.every((entry) => entry.id),
      "every task file declares an id",
    ).toBe(true);

    const unique = new Set(ids.map((entry) => entry.id));
    expect(unique.size, "task ids are unique").toBe(ids.length);

    // The scheduler addresses tasks by both filename and id, so they must agree.
    const mismatched = ids
      .filter((entry) => `${entry.id}.md` !== entry.file)
      .map((entry) => `${entry.file} declares ${entry.id}`);
    expect(mismatched).toEqual([]);
  });
});

describe("workspace manifests", () => {
  it("pins the package manager so CI and local runs agree", () => {
    const pkg = readJson("package.json");
    expect(pkg.packageManager).toMatch(/^pnpm@10\./);
    expect(pkg.engines.node).toBe(">=24");
  });

  it("registers apps/*, packages/* and tests/* as workspace globs", () => {
    const workspace = readFileSync("pnpm-workspace.yaml", "utf8");
    const globs = [...workspace.matchAll(/^\s*-\s*"([^"]+)"/gm)].map((m) => m[1]);
    expect(globs).toEqual(["apps/*", "packages/*", "tests/*"]);
  });

  it("ships a dev-only env template and never a real .env", () => {
    expect(existsSync(".env.example")).toBe(true);
    expect(existsSync(".env")).toBe(false);
  });
});
describe("loop runnability (TMU-OPS-011)", () => {
  it("builds the web Dockerfile in CI without skipping (TMU-OPS-012)", () => {
    expect(existsSync("infra/docker/web.Dockerfile")).toBe(true);
    expect(existsSync(".dockerignore") || existsSync("infra/docker/.dockerignore")).toBe(true);
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    const idx = ci.indexOf("\n  docker-build:");
    expect(idx, "ci.yml declares a docker-build job").toBeGreaterThan(-1);
    const block = ci.slice(idx);
    expect(block).toContain("docker build -f infra/docker/web.Dockerfile .");
    expect(block).not.toContain("exists == 'no'");
  });

  it("gives every M0 owner agent the paths its tasks need", () => {
    // Review cycle 1 (MAJOR): asserting the agent file exists is not enough. Assert the
    // allowlists cover the files the rewritten M0 tasks list, so a lane gap fails here.
    const required = {
      "ops-dev": ["scripts/**", "package.json", ".github/**", ".opencode/**", "infra/**"],
      "backend-dev": ["tests/db/**"],
      "frontend-dev": ["apps/web/**"],
      "qa-engineer": ["tests/**"],
      "ml-dev": ["services/ml/**"],
      architect: ["packages/contracts/**"],
    };
    for (const [agent, paths] of Object.entries(required)) {
      const text = readFileSync(`.opencode/agents/${agent}.md`, "utf8");
      for (const p of paths) {
        expect(text, `${agent} may edit ${p}`).toContain(`"${p}": allow`);
      }
    }
  });

  it("routes package gate steps through the dispatcher", () => {
    const pkg = readJson("package.json");
    const dispatched = [
      "contracts:build",
      "contracts:check",
      "contracts:lint",
      "contracts:breaking",
      "db:check",
      "db:generate",
      "db:migrate",
      "seed",
      "test:integration",
      "test:contract",
      "test:e2e",
    ];
    for (const name of dispatched) {
      expect(pkg.scripts[name], `${name} uses the dispatcher`).toContain("scripts/checks/step.mjs");
    }
  });

  it("dispatches to the package when it exists and to the placeholder when it does not", async () => {
    const { planStep, ROUTES } = await import("./step.mjs");
    const absent = () => false;
    const present = () => true;

    // Fail-closed: a package that exists runs its real script; a failing script propagates.
    const real = planStep("contracts:check", present);
    expect(real.kind).toBe("real");
    expect(real.command).toContain("@temuunair/contracts");

    // Placeholder only when the owning package is absent, and it names the step.
    const pending = planStep("db:check", absent);
    expect(pending.kind).toBe("pending");
    expect(pending.command).toContain("pending.mjs db:check");

    // Unknown steps must not silently pass.
    expect(() => planStep("nope", absent)).toThrow(/Unknown dispatched step/);

    // Every dispatched step has a route with a package dir and script.
    for (const [name, [dir, filter, script]] of Object.entries(ROUTES)) {
      expect(dir, name).toMatch(/^(packages|tests)\//);
      expect(filter, name).toMatch(/^@temuunair\//);
      expect(script, name).toBeTruthy();
    }
  });

  it("runs the real command and propagates a failing child exit", async () => {
    const { runStep } = await import("./step.mjs");
    const calls = [];
    const plan = runStep("db:check", {
      exists: () => true,
      run: (cmd) => calls.push(cmd),
    });
    expect(plan.kind).toBe("real");
    expect(calls).toEqual(["pnpm --filter @temuunair/db run check"]);

    // A failing child must surface, not be swallowed.
    expect(() =>
      runStep("db:check", {
        exists: () => true,
        run: () => {
          throw new Error("child exited 3");
        },
      }),
    ).toThrow(/child exited 3/);
  });

  it("codifies the merge gate (DEC-020)", () => {
    const loop = readFileSync("docs/05-workflow/02-agent-loop.md", "utf8");
    expect(loop).toContain("MERGE GATE");
    const git = readFileSync("docs/05-workflow/01-git-workflow.md", "utf8");
    expect(git).toContain("Any agent may squash-merge");
  });

  it("gives every task an owner agent that exists", () => {
    const taskDir = "docs/08-project/tasks";
    const files = readdirSync(taskDir).filter((f) => f.endsWith(".md"));
    const agents = readdirSync(".opencode/agents")
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
    for (const file of files) {
      const owner = readFileSync(`${taskDir}/${file}`, "utf8")
        .match(/^owner: (.+)$/m)?.[1]
        ?.trim();
      expect(owner, `${file} declares an owner`).toBeTruthy();
      expect(agents, `${file} owner "${owner}" is an agent file`).toContain(owner);
    }
  });
});

describe("gh pr permissions (TMU-OPS-015)", () => {
  // Same evaluation order as the permission engine: the LAST matching rule wins, so the
  // broad `gh pr*: deny` catch-all sits first and the narrow allows follow it.
  const resolve = (rules, command) => {
    let action = null;
    for (const [pattern, ruleAction] of rules) {
      const re = new RegExp(
        "^" +
          pattern
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*")
            .replace(/\?/g, ".") +
          "$",
      );
      if (re.test(command)) action = ruleAction;
    }
    return action;
  };

  const globalRules = () => Object.entries(readJson("opencode.json").permission.bash);

  // Only the `bash:` map — scanning the whole front-matter would pick up `edit:`/`task:` rules
  // (e.g. orchestrator's `task: "*": allow`) and make every command resolve to allow.
  const agentRules = (agent) => {
    const text = readFileSync(`.opencode/agents/${agent}.md`, "utf8");
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
    expect(fm, `${agent}.md has front-matter`).toBeTruthy();
    const lines = fm.split(/\r?\n/);
    const start = lines.findIndex((l) => /^ {2}bash:\s*$/.test(l));
    expect(start, `${agent}.md has a bash permission block`).toBeGreaterThan(-1);
    const rules = [];
    for (const line of lines.slice(start + 1)) {
      if (/^\s*$/.test(line)) continue;
      if (!/^ {4}/.test(line)) break;
      const m = line.match(/^ {4}"([^"]+)":\s*(allow|deny|ask)\s*$/);
      if (m) rules.push([m[1], m[2]]);
    }
    return rules;
  };

  it("allows gh pr edit globally without reopening the merge gate", () => {
    const rules = globalRules();
    expect(resolve(rules, "gh pr edit 2 --body-file body.md")).toBe("allow");
    expect(resolve(rules, "gh pr view 2")).toBe("allow");
    expect(resolve(rules, "gh pr checks 2")).toBe("allow");
    // DEC-020 supersedes the orchestrator-only merge gate: any session may merge at step 12.
    expect(resolve(rules, "gh pr merge 2 --squash")).toBe("allow");
  });

  it("lets git-steward refresh the PR body and the orchestrator edit PR metadata", () => {
    expect(resolve(agentRules("git-steward"), "gh pr edit 2 --body-file x.md")).toBe("allow");
    expect(resolve(agentRules("orchestrator"), "gh pr edit 2 --add-label ops")).toBe("allow");
    // Agents that do not maintain PRs get no grant, so the allowlist stays meaningful:
    // backend-dev falls through to its `*: ask`; docs-keeper to its `*: deny`.
    expect(resolve(agentRules("backend-dev"), "gh pr edit 2")).toBe("ask");
    expect(resolve(agentRules("docs-keeper"), "gh pr edit 2")).toBe("deny");
  });

  it("lets any session merge at step 12 (DEC-020)", () => {
    expect(resolve(globalRules(), "gh pr merge 2 --squash")).toBe("allow");
    expect(resolve(agentRules("git-steward"), "gh pr merge 2 --squash")).toBe("allow");
    expect(resolve(agentRules("orchestrator"), "gh pr merge 2 --squash")).toBe("allow");
  });

  it("keeps merge out of the docs-keeper and reviewer rulesets (DEC-020)", () => {
    expect(resolve(agentRules("docs-keeper"), "gh pr merge 2 --squash")).toBe("deny");
    expect(resolve(agentRules("reviewer"), "gh pr merge 2 --squash")).toBe("deny");
    // Push stays git-steward-only: the global rules deny every `git push*`.
    expect(resolve(globalRules(), "git push origin HEAD")).toBe("deny");
  });

  it("accepts the redirect suffix agents append to push commands (TMU-OPS-016)", () => {
    expect(resolve(agentRules("git-steward"), "git push origin HEAD 2>&1")).toBe("allow");
    expect(resolve(agentRules("git-steward"), "git push -u origin HEAD 2>&1")).toBe("allow");
    expect(resolve(agentRules("git-steward"), "git push origin HEAD")).toBe("allow");
    // force-with-lease must stay guarded even once the redirect suffix is accepted.
    expect(resolve(agentRules("git-steward"), "git push --force-with-lease origin HEAD")).toBe(
      "ask",
    );
    expect(resolve(globalRules(), "git push origin HEAD 2>&1")).toBe("deny");
  });

  it("guards the widened push patterns against force, refspec and hook bypass (TMU-OPS-016)", () => {
    const rules = agentRules("git-steward");
    expect(resolve(rules, "git push origin HEAD:main")).toBe("deny");
    expect(resolve(rules, "git push origin HEAD:refs/heads/main")).toBe("deny");
    expect(resolve(rules, "git push origin HEAD --force")).toBe("deny");
    expect(resolve(rules, "git push origin HEAD --no-verify")).toBe("deny");
    expect(resolve(rules, "git push --force-with-lease origin HEAD 2>&1")).toBe("ask");
    // Review cycle 2 (c2-3): the HEAD* allow must not smuggle short flags or revision
    // refspecs past the deny list, and a refspec stays denied even under force-with-lease.
    expect(resolve(rules, "git push origin HEAD -f")).toBe("deny");
    expect(resolve(rules, "git push -f origin HEAD")).toBe("deny");
    expect(resolve(rules, "git push origin HEAD~:main")).toBe("deny");
    expect(resolve(rules, "git push origin HEAD^:main")).toBe("deny");
    expect(resolve(rules, "git push --force origin HEAD")).toBe("deny");
    expect(resolve(rules, "git push --no-verify origin HEAD")).toBe("deny");
    expect(resolve(rules, "git push origin HEAD:main 2>&1")).toBe("deny");
    expect(resolve(rules, "git push --force-with-lease origin HEAD:main")).toBe("deny");
  });
});

describe("shared Vitest preset (TMU-OPS-016)", () => {
  it("raises the shared Vitest timeout for the cold ESLint load (TMU-OPS-016)", () => {
    const preset = readFileSync("packages/config/vitest.base.ts", "utf8");
    expect(preset.replace(/\s+/g, "")).toContain("testTimeout:15000");
    // The root config must keep delegating to the shared preset.
    expect(readFileSync("vitest.config.ts", "utf8")).toContain("@temuunair/config/vitest");
  });
});
