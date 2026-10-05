import { describe, expect, it } from "vitest";

import { WIZARD_STEP_KEYS, canProceedStep1, canProceedStep2, stepTitleKey } from "./wizard-steps";

describe("wizard step lists", () => {
  it("gives LOST reports five steps ending in review", () => {
    expect(WIZARD_STEP_KEYS.LOST).toEqual(["category", "photos", "details", "where", "review"]);
  });

  it("gives FOUND reports seven steps with custody and hints", () => {
    expect(WIZARD_STEP_KEYS.FOUND).toEqual([
      "category",
      "photos",
      "details",
      "where",
      "custody",
      "hints",
      "review",
    ]);
  });

  it("maps every step key to its i18n title", () => {
    expect(stepTitleKey("category")).toBe("report.wizard.step.category.title");
    expect(stepTitleKey("photos")).toBe("report.wizard.step.photos.title");
    expect(stepTitleKey("details")).toBe("report.wizard.step.details.title");
    expect(stepTitleKey("where")).toBe("report.wizard.step.where.title");
    expect(stepTitleKey("custody")).toBe("report.wizard.step.custody.title");
    expect(stepTitleKey("hints")).toBe("report.wizard.step.hints.title");
    expect(stepTitleKey("review")).toBe("report.wizard.step.review.title");
  });
});

describe("canProceedStep1", () => {
  it("requires both a type and a category", () => {
    expect(canProceedStep1({})).toBe(false);
    expect(canProceedStep1({ type: "LOST" })).toBe(false);
    expect(canProceedStep1({ category: "BAG" })).toBe(false);
    expect(canProceedStep1({ type: "LOST", category: "BAG" })).toBe(true);
    expect(canProceedStep1({ type: "FOUND", category: "ID_CARD" })).toBe(true);
  });

  it("rejects values that fail the shared contract schema", () => {
    expect(canProceedStep1({ type: "MAYBE", category: "BAG" })).toBe(false);
    expect(canProceedStep1({ type: "LOST", category: "CAT" })).toBe(false);
  });
});

describe("canProceedStep2", () => {
  it("blocks FOUND reports until at least one photo is ready", () => {
    expect(canProceedStep2("FOUND", { readyCount: 0, inFlight: false })).toBe(false);
    expect(canProceedStep2("FOUND", { readyCount: 1, inFlight: false })).toBe(true);
  });

  it("lets LOST reports continue without photos", () => {
    expect(canProceedStep2("LOST", { readyCount: 0, inFlight: false })).toBe(true);
    expect(canProceedStep2("LOST", { readyCount: 2, inFlight: false })).toBe(true);
  });

  it("blocks both types while uploads are still in flight", () => {
    expect(canProceedStep2("LOST", { readyCount: 1, inFlight: true })).toBe(false);
    expect(canProceedStep2("FOUND", { readyCount: 1, inFlight: true })).toBe(false);
  });
});
