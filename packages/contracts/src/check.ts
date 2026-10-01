// Generated-file drift detection (TMU-OPS-004; docs/04-contracts/README.md governance).
// Pure: the caller supplies `expected` bytes and a `read` accessor, so this is testable without
// touching the filesystem. `scripts/check.ts` wires the real generator and disk reader.
import type { GeneratedFile } from "./generate.ts";

export type Drift = { path: string; reason: string };

export function diffGenerated(
  expected: GeneratedFile[],
  read: (path: string) => string | null,
): Drift[] {
  const drifts: Drift[] = [];
  for (const file of expected) {
    const actual = read(file.path);
    if (actual === null) {
      drifts.push({ path: file.path, reason: "missing" });
      continue;
    }
    if (actual !== file.content) {
      drifts.push({ path: file.path, reason: "out of sync (hand-edited or stale)" });
    }
  }
  return drifts;
}
