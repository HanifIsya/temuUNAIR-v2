import type { components } from "@temuunair/contracts/generated/types";

export type Me = components["schemas"]["API-ME-01Response"];
export type UserRole = Me["role"];
export type Locale = "id" | "en";
