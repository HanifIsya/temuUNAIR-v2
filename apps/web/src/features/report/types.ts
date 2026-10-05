// Contract-derived types for the report wizard.
//
// Types come from the OpenAPI-generated `types.ts` (a self-contained generated
// file with no relative imports, so it typechecks under tsconfig.test.json);
// runtime schemas live in `./schemas`.
import type { components } from "@temuunair/contracts/generated/types";

export type ApiCategories = components["schemas"]["API-META-01Response"];

export type CategoryValue = ApiCategories[number]["value"];

export type ApiCampuses = components["schemas"]["API-META-02Response"];

export type CampusValue = ApiCampuses[number]["id"];

export type ApiLocations = components["schemas"]["API-META-03Response"];

export type LocationValue = ApiLocations[number];

export type ApiDropPoints = components["schemas"]["API-META-04Response"];

export type DropPointValue = ApiDropPoints[number];

export type ReportCreateRequest = components["schemas"]["API-REP-01Request"];

export type ReportTypeValue = ReportCreateRequest["type"];

export type CustodyValue = NonNullable<ReportCreateRequest["custody"]>;
