// Runtime Zod mirrors of the contract schemas used by the report wizard.
//
// TMU-FE-003: test files under apps/web are typechecked by the root
// `tsconfig.test.json`, which does not enable `allowImportingTsExtensions`, and every
// module inside `packages/contracts/src` imports siblings with explicit `.ts`
// specifiers, so a static import of `@temuunair/contracts/src/common` fails
// `pnpm typecheck` with TS5097 (root `tsconfig*.json` is ops-lane and cannot be
// changed here — same constraint as TMU-BE-003 note 2). `src/enums.ts` has no
// relative imports, so it imports statically and supplies every enum rule below;
// `contract-parity.test.ts` loads the real contract schemas through the established
// non-literal dynamic-import escape hatch and asserts sample-for-sample parity
// (success flags *and* parsed output), so drift breaks CI. If ops later enables
// `allowImportingTsExtensions`, these mirrors can be replaced with direct
// `ReportCreate`/`CategoryMeta` imports.
import { Category, ReportType } from "@temuunair/contracts/src/enums";
import { z } from "zod";

/** Step 1 gate: both a type and a category are required before advancing. */
export const step1Schema = z.object({
  type: ReportType,
  category: Category,
});

/** RHF step-1 form: fields fill in incrementally, so each one is optional. */
export const wizardFormSchema = step1Schema.partial();

/** Draft payload: `ReportCreate.pick({ type, category, imageIds })` (imageIds default []). */
export const draftDataSchema = z.object({
  type: ReportType,
  category: Category,
  imageIds: z.array(z.string().uuid()).default([]),
});

/** One API-META-01 catalog row (`CategoryMeta` in the contract). */
export const categoryMetaSchema = z.object({
  value: Category,
  labelKey: z.string(),
  isSensitive: z.boolean(),
  hintPrompts: z.array(z.string()),
});

/** The API-META-01 response body (`z.array(CategoryMeta)`). */
export const categoryListSchema = z.array(categoryMetaSchema);
