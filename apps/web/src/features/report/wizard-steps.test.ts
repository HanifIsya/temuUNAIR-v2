import { describe, expect, it } from "vitest";

import {
  WIZARD_STEP_KEYS,
  canProceedStep1,
  canProceedStep2,
  canProceedStep3,
  canProceedStep4,
  canProceedStep5,
  canProceedStep6,
  stepTitleKey,
} from "./wizard-steps";

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

describe("canProceedStep3 (Details)", () => {
  const valid = {
    title: "Tas ransel hitam",
    description: "Tas ransel hitam merk Eiger dengan gantungan kunci.",
    colors: ["Hitam"],
    brand: "Eiger",
  };

  it("accepts valid details within contract limits", () => {
    expect(canProceedStep3(valid)).toBe(true);
    expect(canProceedStep3({ ...valid, brand: undefined, colors: [] })).toBe(true);
  });

  it("rejects title shorter than 3 or longer than 80 chars", () => {
    expect(canProceedStep3({ ...valid, title: "Ta" })).toBe(false);
    expect(canProceedStep3({ ...valid, title: "a".repeat(81) })).toBe(false);
  });

  it("rejects description shorter than 10 or longer than 1000 chars", () => {
    expect(canProceedStep3({ ...valid, description: "Singkat" })).toBe(false);
    expect(canProceedStep3({ ...valid, description: "a".repeat(1001) })).toBe(false);
  });

  it("rejects more than 3 colors", () => {
    expect(canProceedStep3({ ...valid, colors: ["Hitam", "Biru", "Merah", "Kuning"] })).toBe(false);
  });
});

describe("canProceedStep4 (Location & Time)", () => {
  const NOW = new Date("2026-10-05T12:00:00+07:00");
  const valid = {
    type: "LOST" as const,
    location: { campus: "KAMPUS_B" as const, note: "Dekat perpustakaan" },
    occurredAt: { from: "2026-10-04T10:00:00+07:00" },
  };

  it("accepts valid campus and past timestamp within 180 days", () => {
    expect(canProceedStep4(valid, NOW)).toBe(true);
    expect(
      canProceedStep4(
        {
          ...valid,
          occurredAt: {
            from: "2026-10-04T10:00:00+07:00",
            to: "2026-10-04T12:00:00+07:00",
          },
        },
        NOW,
      ),
    ).toBe(true);
  });

  it("rejects missing campus", () => {
    expect(
      canProceedStep4({ ...valid, location: { campus: undefined as unknown as "KAMPUS_B" } }, NOW),
    ).toBe(false);
  });

  it("rejects occurredAt.from in the future", () => {
    expect(
      canProceedStep4({ ...valid, occurredAt: { from: "2026-10-06T10:00:00+07:00" } }, NOW),
    ).toBe(false);
  });

  it("rejects LOST older than 180 days", () => {
    expect(
      canProceedStep4({ ...valid, occurredAt: { from: "2026-01-01T10:00:00+07:00" } }, NOW),
    ).toBe(false);
  });

  it("rejects occurredAt.to earlier than occurredAt.from", () => {
    expect(
      canProceedStep4(
        {
          ...valid,
          occurredAt: {
            from: "2026-10-04T12:00:00+07:00",
            to: "2026-10-04T10:00:00+07:00",
          },
        },
        NOW,
      ),
    ).toBe(false);
  });
});

describe("canProceedStep5 (Custody for FOUND)", () => {
  const DROP_POINT_ID = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e80";

  it("accepts HELD_BY_FINDER without dropPointId", () => {
    expect(canProceedStep5({ custody: "HELD_BY_FINDER" })).toBe(true);
  });

  it("accepts AT_DROP_POINT when dropPointId is provided", () => {
    expect(canProceedStep5({ custody: "AT_DROP_POINT", dropPointId: DROP_POINT_ID })).toBe(true);
  });

  it("rejects AT_DROP_POINT without dropPointId", () => {
    expect(canProceedStep5({ custody: "AT_DROP_POINT" })).toBe(false);
    expect(canProceedStep5({ custody: "AT_DROP_POINT", dropPointId: "" })).toBe(false);
  });

  it("rejects empty or missing custody", () => {
    expect(canProceedStep5({})).toBe(false);
  });
});

describe("canProceedStep6 (Hints for FOUND)", () => {
  const hint1 = { prompt: "Apa isi kantong depan?", answer: "Kunci kos dan flashdisk" };
  const hint2 = { prompt: "Ada stiker apa di belakang?", answer: "Stiker BEM UNAIR" };

  it("requires at least 1 hint for standard items", () => {
    expect(canProceedStep6({ hints: [] }, false)).toBe(false);
    expect(canProceedStep6({ hints: [hint1] }, false)).toBe(true);
  });

  it("requires at least 2 hints for sensitive items", () => {
    expect(canProceedStep6({ hints: [hint1] }, true)).toBe(false);
    expect(canProceedStep6({ hints: [hint1, hint2] }, true)).toBe(true);
  });

  it("rejects more than 3 hints", () => {
    const hint3 = { prompt: "Warna resleting?", answer: "Merah" };
    const hint4 = { prompt: "Merk gantungan?", answer: "Unair" };
    expect(canProceedStep6({ hints: [hint1, hint2, hint3, hint4] }, false)).toBe(false);
  });

  it("rejects empty prompt or answer", () => {
    expect(canProceedStep6({ hints: [{ prompt: "", answer: "Ada" }] }, false)).toBe(false);
    expect(canProceedStep6({ hints: [{ prompt: "Pertanyaan?", answer: "" }] }, false)).toBe(false);
  });
});
