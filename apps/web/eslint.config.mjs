// Package-level entry point; the workspace gate runs ESLint from the repo root, which lints
// this package through the shared preset (packages/config).
import preset from "@temuunair/config/eslint";

export default preset;
