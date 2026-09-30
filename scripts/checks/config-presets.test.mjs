// Shared config presets (TMU-OPS-002).
//
// These tests guard the delegation contract: packages/config owns the presets and the root
// configs stay thin entry points. A root config that silently re-adds its own options would
// drift from the presets, so every delegation is asserted here — including an end-to-end
// ESLint run through the real root config.
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const read = (path) => readFileSync(path, "utf8");

describe("packages/config manifest", () => {
  it("exists with the required name, visibility and module type", () => {
    expect(existsSync("packages/config/package.json")).toBe(true);
    const pkg = readJson("packages/config/package.json");
    expect(pkg.name).toBe("@temuunair/config");
    expect(pkg.private).toBe(true);
    expect(pkg.type).toBe("module");
  });

  it("exports the four presets and every target file exists", () => {
    const pkg = readJson("packages/config/package.json");
    const expected = {
      "./eslint": "./eslint.config.mjs",
      "./prettier": "./prettier.json",
      "./tsconfig.base.json": "./tsconfig.base.json",
      "./vitest": "./vitest.base.ts",
    };
    expect(pkg.exports).toMatchObject(expected);
    for (const target of Object.values(expected)) {
      expect(existsSync(`packages/config/${target.slice(2)}`), target).toBe(true);
    }
  });

  it("declares the preset dependencies and keeps vitest for the type-only import", () => {
    const pkg = readJson("packages/config/package.json");
    expect(pkg.dependencies).toMatchObject({
      "@eslint/js": expect.any(String),
      globals: expect.any(String),
      "typescript-eslint": expect.any(String),
    });
    expect(pkg.devDependencies.vitest).toEqual(expect.any(String));
  });
});

describe("preset contents", () => {
  it("enables the strict trio in the shared tsconfig", () => {
    const tsconfig = readJson("packages/config/tsconfig.base.json");
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noUncheckedIndexedAccess).toBe(true);
    expect(tsconfig.compilerOptions.noImplicitOverride).toBe(true);
  });

  it("keeps the Prettier options in the preset", () => {
    const prettier = readJson("packages/config/prettier.json");
    expect(prettier).toMatchObject({
      printWidth: 100,
      singleQuote: false,
      semi: true,
      trailingComma: "all",
      arrowParens: "always",
      endOfLine: "lf",
    });
  });
});

describe("root delegation", () => {
  it("extends the shared tsconfig without duplicating options", () => {
    const tsconfig = readJson("tsconfig.base.json");
    expect(tsconfig.extends).toBe("@temuunair/config/tsconfig.base.json");
    expect(tsconfig.compilerOptions).toBeUndefined();
  });

  it("moves preset-only dependencies out of the root manifest", () => {
    const root = readJson("package.json");
    expect(root.devDependencies["@temuunair/config"]).toBe("workspace:*");
    for (const moved of ["@eslint/js", "globals", "typescript-eslint"]) {
      expect(root.devDependencies, moved).not.toHaveProperty(moved);
    }
  });

  it("imports the ESLint, Vitest and Prettier presets from the workspace package", () => {
    expect(read("eslint.config.mjs")).toContain("@temuunair/config/eslint");
    expect(read("vitest.config.ts")).toContain("@temuunair/config/vitest");
    expect(JSON.parse(read(".prettierrc.json"))).toBe("@temuunair/config/prettier");
  });
});

describe("delegated ESLint enforcement", () => {
  it("errors on `any` and `console` through the real root config", async () => {
    const { ESLint } = await import("eslint");
    const eslint = new ESLint({ cwd: process.cwd() });
    const [result] = await eslint.lintText(
      "export function bad(value: any): number { console.log(value); return value; }",
      { filePath: "scripts/tooling/sample.ts" },
    );
    const ruleIds = result.messages.map((m) => m.ruleId);
    expect(ruleIds).toContain("@typescript-eslint/no-explicit-any");
    expect(ruleIds).toContain("no-console");
  });

  it("accepts a clean snippet through the real root config", async () => {
    const { ESLint } = await import("eslint");
    const eslint = new ESLint({ cwd: process.cwd() });
    const [result] = await eslint.lintText("export const answer: number = 42;", {
      filePath: "scripts/tooling/sample.ts",
    });
    expect(result.messages).toEqual([]);
  });
});
