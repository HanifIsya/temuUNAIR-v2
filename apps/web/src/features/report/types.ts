// Contract-derived types for the report wizard.
//
// Types come from the OpenAPI-generated `types.ts` (a self-contained generated
// file with no relative imports, so it typechecks under tsconfig.test.json);
// runtime schemas live in `./schemas`.
import type { components } from "@temuunair/contracts/generated/types";

export type ApiCategories = components["schemas"]["API-META-01Response"];

export type CategoryValue = ApiCategories[number]["value"];

export type ReportCreateRequest = components["schemas"]["API-REP-01Request"];

export type ReportTypeValue = ReportCreateRequest["type"];
