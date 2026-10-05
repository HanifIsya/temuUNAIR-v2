// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DRAFT_VERSION, clearDraft, draftKey, loadDraft, saveDraft } from "./draft";

const NOW = new Date("2026-10-05T10:00:00+07:00");
const LATER = new Date("2026-10-05T12:00:00+07:00");
const IMAGE_ID = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82";

const validData = {
  type: "LOST" as const,
  category: "BAG" as const,
  imageIds: [IMAGE_ID],
};

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("report draft storage", () => {
  it("keys drafts per report type under the FE-004 scheme", () => {
    expect(draftKey("LOST")).toBe("tu.draft.report.lost");
    expect(draftKey("FOUND")).toBe("tu.draft.report.found");
  });

  it("round-trips a saved draft", () => {
    saveDraft("LOST", validData, NOW);

    expect(loadDraft("LOST", LATER)).toEqual(validData);
  });

  it("keeps the draft for each type separate", () => {
    saveDraft("LOST", validData, NOW);

    expect(loadDraft("FOUND", LATER)).toBeNull();
    expect(loadDraft("LOST", LATER)).toEqual(validData);
  });

  it("ignores a stale envelope version and clears the key", () => {
    localStorage.setItem(
      draftKey("LOST"),
      JSON.stringify({
        version: DRAFT_VERSION + 1,
        savedAt: NOW.toISOString(),
        data: validData,
      }),
    );

    expect(loadDraft("LOST", LATER)).toBeNull();
    expect(localStorage.getItem(draftKey("LOST"))).toBeNull();
  });

  it("ignores a shape that fails the shared contract schema", () => {
    localStorage.setItem(
      draftKey("LOST"),
      JSON.stringify({
        version: DRAFT_VERSION,
        savedAt: NOW.toISOString(),
        data: { type: "LOST", category: "NOT_A_CATEGORY", imageIds: [] },
      }),
    );

    expect(loadDraft("LOST", LATER)).toBeNull();
  });

  it("ignores corrupt JSON", () => {
    localStorage.setItem(draftKey("LOST"), "{not json");

    expect(loadDraft("LOST", LATER)).toBeNull();
    expect(localStorage.getItem(draftKey("LOST"))).toBeNull();
  });

  it("discards a draft older than 24 hours", () => {
    saveDraft("LOST", validData, NOW);

    const afterTtl = new Date(NOW.getTime() + 24 * 60 * 60 * 1000 + 1000);

    expect(loadDraft("LOST", afterTtl)).toBeNull();
    expect(localStorage.getItem(draftKey("LOST"))).toBeNull();
  });

  it("clearDraft removes only the given type", () => {
    const foundData = { ...validData, type: "FOUND" as const };
    saveDraft("LOST", validData, NOW);
    saveDraft("FOUND", foundData, NOW);

    clearDraft("LOST");

    expect(localStorage.getItem(draftKey("LOST"))).toBeNull();
    expect(loadDraft("FOUND", LATER)).toEqual(foundData);
  });

  it("NEVER persists verification hint answers in localStorage (privacy check)", () => {
    const payloadWithHints = {
      ...validData,
      type: "FOUND" as const,
      title: "Dompet cokelat",
      description: "Ditemukan di lobi FK",
      hints: [{ prompt: "Apa warna gantungan kunci?", answer: "KUNING_RAHASIA" }],
    };

    saveDraft("FOUND", payloadWithHints as unknown as typeof validData, NOW);

    const rawStored = localStorage.getItem(draftKey("FOUND"));
    expect(rawStored).not.toBeNull();
    // Raw JSON in localStorage must NEVER contain the secret answer
    expect(rawStored).not.toContain("KUNING_RAHASIA");

    const loaded = loadDraft("FOUND", LATER) as typeof payloadWithHints;
    expect(loaded).not.toBeNull();
    if (loaded.hints) {
      for (const hint of loaded.hints) {
        expect(hint.answer).not.toBe("KUNING_RAHASIA");
      }
    }
  });
});
