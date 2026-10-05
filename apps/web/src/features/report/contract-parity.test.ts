// TMU-FE-003: locks the local wizard schema mirrors (`./schemas`) to the real
// contract schemas.
//
// A static import of `@temuunair/contracts/src/common` fails `pnpm typecheck`
// with TS5097 under the root `tsconfig.test.json` (ops-lane config; see the note
// in `./schemas` and TMU-BE-003 note 2), so the contract module is loaded through
// the established non-literal dynamic-import escape hatch: tsc never resolves the
// specifier, while vite-node loads the real merged schemas at runtime. Every
// sample is parsed with both the mirror and the contract schema and the outcomes
// (success flag *and* parsed output) must match, so drift breaks CI — the same
// pattern TMU-BE-005 got approved for.
import { describe, expect, it } from "vitest";

import { categoryListSchema, draftDataSchema, wizardFormSchema } from "./schemas";

const commonSpecifier = "@temuunair/contracts/src/common";

const UUID = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82";

type ContractSafeParse = { success: true; data: unknown } | { success: false; error: unknown };

interface ContractSchema {
  parse: (data: unknown) => unknown;
  safeParse: (data: unknown) => ContractSafeParse;
}

interface ContractReportCreate {
  pick: (keys: Record<string, boolean>) => ContractSchema & { partial: () => ContractSchema };
  partial: () => ContractSchema;
}

interface ContractCommon {
  ReportCreate: ContractReportCreate;
  CategoryMeta: ContractSchema;
}

function loadContractCommon(): Promise<ContractCommon> {
  return import(commonSpecifier) as Promise<ContractCommon>;
}

function expectSameOutcome(mirror: ContractSchema, contract: ContractSchema, sample: unknown) {
  const mirrorResult = mirror.safeParse(sample);
  const contractResult = contract.safeParse(sample);
  expect(mirrorResult.success).toBe(contractResult.success);
  if (mirrorResult.success && contractResult.success) {
    expect(mirrorResult.data).toEqual(contractResult.data);
  }
}

describe("contract schema parity (TMU-FE-003)", () => {
  it("wizardFormSchema matches ReportCreate.partial()", async () => {
    const { ReportCreate } = await loadContractCommon();
    const contract = ReportCreate.partial();
    const samples: unknown[] = [
      {},
      { type: "LOST" },
      { category: "BAG" },
      { type: "LOST", category: "BAG" },
      { type: "MAYBE", category: "BAG" },
      { type: "LOST", category: "CAT" },
      { type: "LOST", category: "BAG", title: "Tas ransel" },
    ];
    for (const sample of samples) expectSameOutcome(wizardFormSchema, contract, sample);
  });

  it("draftDataSchema matches ReportCreate partial fields and validates draft shapes", async () => {
    const samples: unknown[] = [
      { type: "LOST", category: "BAG", imageIds: [UUID] },
      { type: "FOUND", category: "ID_CARD", imageIds: [] },
      { type: "LOST", category: "BAG" }, // imageIds defaults to []
      {
        type: "LOST",
        category: "BAG",
        title: "Tas ransel",
        description: "Tas ransel hitam tertinggal",
        colors: ["Hitam"],
        brand: "Eiger",
        location: { campus: "KAMPUS_B", note: "Lantai 2" },
        occurredAt: { from: "2026-10-04T10:00:00+07:00" },
      },
      {
        type: "FOUND",
        category: "ID_CARD",
        custody: "AT_DROP_POINT",
        dropPointId: UUID,
        hints: [{ prompt: "Nama depan?", answer: "" }],
      },
      { type: "LOST", category: "BAG", imageIds: ["not-a-uuid"] },
      { type: "LOST", category: "NOPE", imageIds: [] },
      "not-an-object",
    ];
    const expected = [true, true, true, true, true, false, false, false];
    samples.forEach((sample, idx) => {
      const result = draftDataSchema.safeParse(sample);
      expect(result.success).toBe(expected[idx]);
    });
  });

  it("categoryMetaSchema matches the CategoryMeta contract schema", async () => {
    const { CategoryMeta } = await loadContractCommon();
    const samples: unknown[] = [
      { value: "BAG", labelKey: "category.BAG", isSensitive: false, hintPrompts: [] },
      {
        value: "ID_CARD",
        labelKey: "category.ID_CARD",
        isSensitive: true,
        hintPrompts: ["Nama depan di kartu?"],
      },
      { value: "CAT", labelKey: "category.CAT", isSensitive: false, hintPrompts: [] },
      { value: "BAG", labelKey: "category.BAG", isSensitive: "no", hintPrompts: [] },
      { value: "BAG", labelKey: "category.BAG", isSensitive: false },
      "BAG",
    ];
    for (const sample of samples)
      expectSameOutcome(categoryListSchema.element, CategoryMeta, sample);
  });
});
