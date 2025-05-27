// @ts-check

/**
 * @typedef {import('eslint').Linter.Config} ESLintConfig
 */

/**
 * Base ESLint configuration with import rules
 * Applied to all files in projects using this config
 */

import * as importPlugin from "eslint-plugin-import-x";

import explicitDecisionsPlugin from "../../eslint-plugin/src/index.js";

/**
 * Configure import plugin rules
 * @type {ESLintConfig}
 */
export const importConfig = {
  plugins: {
    "import-x": /** @type {any} */ (importPlugin),
    "@explicit-decisions": /** @type {any} */ (explicitDecisionsPlugin),
  },
  rules: {
    // Import sorting and organization (these support auto-fix)
    "import-x/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal", 
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import-x/no-duplicates": "error",
    "import-x/newline-after-import": "error",
    "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
    "import-x/no-unresolved": "off", // TypeScript handles this better
    "import-x/extensions": [
      "error",
      "ignorePackages",
      {
        ts: "always",
        tsx: "always", 
        js: "always",
        jsx: "always",
      },
    ],

    // Explicit decisions rules - enforce explicit technical decisions
    "@explicit-decisions/no-mocks-or-spies": "error",
    "@explicit-decisions/require-ts-extensions": "error", 
    "@explicit-decisions/no-npx-usage": "error",
    "@explicit-decisions/prefer-ts-imports": "error",
    "@explicit-decisions/require-factory-functions": "warn",
    "@explicit-decisions/no-any-in-tests": "error", 
    "@explicit-decisions/prefer-real-implementations": "warn",
  },
};

/**
 * Base rules for all JavaScript/TypeScript files
 * @type {Record<string, any>}
 */
export const baseRules = {
  // Core JavaScript rules
  "no-var": "error",
  "prefer-const": "error",
  eqeqeq: ["error", "always"],
  curly: ["error", "all"],
  "no-undef": "off", // TypeScript already handles this better
};