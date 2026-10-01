// Generated-file drift tests (TMU-OPS-004). Frozen interface:
// docs/08-project/tasks/TMU-OPS-004.md "Frozen interface for RED" — diffGenerated compares the
// bytes the generator would write against what is on disk and reports { path, reason } drifts in
// `expected` order. docs/04-contracts/README.md governance says generated artefacts are never
// hand-edited, so `contracts:check` must catch an edit or a missing file.
//
// Fixtures are synthetic; no real people or real UNAIR data (AGENTS.md rule 5). Import order is
// deliberate: "./check.ts" precedes "./generate.ts" so the RED run fails on the missing
// implementation module first.
import { describe, expect, it } from "vitest";
import { diffGenerated, type Drift } from "./check.ts";
import type { GeneratedFile } from "./generate.ts";

const file = (path: string, content: string): GeneratedFile => ({ path, content });

const readFrom = (files: readonly GeneratedFile[]): ((path: string) => string | null) => {
  const byPath = new Map(files.map((entry) => [entry.path, entry.content]));
  return (path) => byPath.get(path) ?? null;
};

const pathsOf = (drifts: readonly Drift[]): string[] => drifts.map((drift) => drift.path);

const driftFor = (drifts: readonly Drift[], path: string): Drift => {
  const drift = drifts.find((candidate) => candidate.path === path);
  if (!drift) throw new Error(`no drift reported for ${path}`);
  return drift;
};

describe("diffGenerated", () => {
  it("reports no drift when every expected file matches on disk", () => {
    const expected = [
      file("a/one.ts", "export const one = 1;\n"),
      file("a/two.ts", "export const two = 2;\n"),
    ];
    expect(diffGenerated(expected, readFrom(expected))).toEqual([]);
  });

  it("reports exactly one drift for a hand-edited file", () => {
    const one = file("a/one.ts", "export const one = 1;\n");
    const two = file("a/two.ts", "export const two = 2;\n");
    const expected = [one, two];
    const onDisk = [one, file("a/two.ts", `${two.content}// hand-edit`)];
    const drifts = diffGenerated(expected, readFrom(onDisk));
    expect(drifts).toHaveLength(1);
    expect(pathsOf(drifts)).toEqual(["a/two.ts"]);
    expect(driftFor(drifts, "a/two.ts").reason.length).toBeGreaterThan(0);
  });

  it("reports exactly one drift for a missing file", () => {
    const one = file("a/one.ts", "export const one = 1;\n");
    const two = file("a/two.ts", "export const two = 2;\n");
    const expected = [one, two];
    const onDisk = [one];
    const drifts = diffGenerated(expected, readFrom(onDisk));
    expect(drifts).toHaveLength(1);
    expect(pathsOf(drifts)).toEqual(["a/two.ts"]);
    expect(driftFor(drifts, "a/two.ts").reason.length).toBeGreaterThan(0);
  });

  it("ignores an extra committed file that is not in expected", () => {
    const one = file("a/one.ts", "export const one = 1;\n");
    const expected = [one];
    const onDisk = [one, file("a/extra.ts", "export const extra = true;\n")];
    expect(diffGenerated(expected, readFrom(onDisk))).toEqual([]);
  });

  it("reports drifts in the order of expected", () => {
    const first = file("a/first.ts", "export const first = 1;\n");
    const second = file("a/second.ts", "export const second = 2;\n");
    const third = file("a/third.ts", "export const third = 3;\n");
    const expected = [first, second, third];
    const onDisk = [file("a/first.ts", "export const first = 99;\n"), second];
    const drifts = diffGenerated(expected, readFrom(onDisk));
    expect(pathsOf(drifts)).toEqual(["a/first.ts", "a/third.ts"]);
  });

  it("reports no drift for an empty expected list", () => {
    expect(diffGenerated([], readFrom([]))).toEqual([]);
  });
});
