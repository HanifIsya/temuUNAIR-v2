// Shared ESLint flat config preset (TMU-OPS-002). The workspace entry point is the root
// `eslint.config.mjs`, which re-exports this file.
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/next-env.d.ts",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "packages/contracts/generated/**",
      "services/ml/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Node tooling: scripts, config files and the worker run on Node, not in the browser.
    files: [
      "scripts/**/*.{js,mjs,cjs,ts,mts,cts}",
      "**/*.config.{js,mjs,cjs,ts,mts,cts}",
      "apps/worker/**/*.{ts,mts,cts}",
      "**/*.test.{js,mjs,cjs,ts,tsx}",
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Browser code must not assume Node globals (docs/05-workflow/13-coding-standards.md).
    files: ["apps/web/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      // docs/05-workflow/13-coding-standards.md — forbidden patterns
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    // Scripts, tests and config files may log and use looser typing.
    files: ["scripts/**/*.mjs", "**/*.test.{ts,tsx}", "**/*.config.{ts,mjs}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
