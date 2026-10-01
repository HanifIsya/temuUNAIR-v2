import { describe, expect, it } from "vitest";
import { planStep } from "../../scripts/checks/step.mjs";

describe("db:check dispatch", () => {
  it("routes to the package script when packages/db exists", () => {
    const plan = planStep("db:check", () => true);
    expect(plan.kind).toBe("real");
    expect(plan.command).toBe("pnpm --filter @temuunair/db run check");
  });

  it("falls back to the named placeholder when packages/db is absent", () => {
    const plan = planStep("db:check", () => false);
    expect(plan.kind).toBe("pending");
    expect(plan.command).toContain("pending.mjs db:check");
  });
});
