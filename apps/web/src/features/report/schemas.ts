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
import { Campus, Category, Custody, ReportType } from "@temuunair/contracts/src/enums";
import { z } from "zod";

/** Step 1 gate: both a type and a category are required before advancing. */
export const step1Schema = z.object({
  type: ReportType,
  category: Category,
});

/** Step 3 details schema. */
export const step3DetailsSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().min(10).max(1000),
  colors: z.array(z.string()).max(3).default([]),
  brand: z.string().max(60).optional(),
});

/** Location input schema for Step 4. */
export const locationInputSchema = z.object({
  campus: Campus,
  locationId: z.string().uuid().optional(),
  note: z.string().max(200).optional(),
});

/** Time window schema for Step 4. */
export const occurredAtWindowSchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }).optional(),
});

/** Step 4 location and occurredAt schema. */
export const step4LocationSchema = z.object({
  location: locationInputSchema,
  occurredAt: occurredAtWindowSchema,
});

/** Step 5 custody schema (FOUND only). */
export const step5CustodySchema = z.object({
  custody: Custody,
  dropPointId: z.string().uuid().optional(),
});

/** Step 6 verification hint input schema (FOUND only). */
export const verificationHintInputSchema = z.object({
  prompt: z.string().min(3).max(200),
  answer: z.string().min(1).max(200),
});

/** Safe verification hint schema for drafts (answer is strictly empty). */
export const verificationHintDraftSchema = z.object({
  prompt: z.string().min(3).max(200),
  answer: z.literal("").default(""),
});

/** Full RHF wizard form schema (mirrors ReportCreate.partial()). */
export const wizardFormSchema = z.object({
  type: ReportType.optional(),
  category: Category.optional(),
  title: z.string().min(3).max(80).optional(),
  description: z.string().min(10).max(1000).optional(),
  colors: z.array(z.string()).default([]).optional(),
  brand: z.string().optional(),
  imageIds: z.array(z.string().uuid()).default([]).optional(),
  location: locationInputSchema.optional(),
  occurredAt: occurredAtWindowSchema.optional(),
  custody: Custody.optional(),
  dropPointId: z.string().uuid().optional(),
  hints: z.array(verificationHintInputSchema).optional(),
});

/** Draft payload saved in localStorage. Hint answers MUST NOT be stored! */
export const draftDataSchema = z.object({
  type: ReportType,
  category: Category,
  imageIds: z.array(z.string().uuid()).default([]),
  title: z.string().optional(),
  description: z.string().optional(),
  colors: z.array(z.string()).optional(),
  brand: z.string().optional(),
  location: z
    .object({
      campus: Campus,
      locationId: z.string().uuid().optional(),
      note: z.string().optional(),
    })
    .optional(),
  occurredAt: z
    .object({
      from: z.string(),
      to: z.string().optional(),
    })
    .optional(),
  custody: Custody.optional(),
  dropPointId: z.string().uuid().optional(),
  hints: z.array(verificationHintDraftSchema).optional(),
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
