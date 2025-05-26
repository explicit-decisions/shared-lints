// @ts-check

/**
 * @typedef {import('eslint').Linter.Config} ESLintConfig
 */

import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

import { baseRules } from "./base.js";

/**
 * Strict TypeScript configuration
 * Based on common patterns from DoctorWhoScripts and mcpify repositories
 * @type {ESLintConfig}
 */
export const strictTypeScriptConfig = {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      projectService: true,
    },
  },
  plugins: {
    "@typescript-eslint": /** @type {any} */ (typescript),
  },
  rules: {
    // Base rules
    ...baseRules,

    // Using TypeScript ESLint plugin's recommended, strict, and strict-type-checked rules as a base
    ...(typescript.configs["recommended"]?.rules || {}),
    ...(typescript.configs["strict"]?.rules || {}),
    ...(typescript.configs["strict-type-checked"]?.rules || {}),
    ...(typescript.configs["stylistic-type-checked"]?.rules || {}),

    // Console rules
    "no-console": "error",

    // TypeScript-specific rules
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: true,
      },
    ],
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-ts-expect-error": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-expect-error": false,
      },
    ],

    // Project-specific strict rules
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/restrict-template-expressions": "error",
    "@typescript-eslint/unbound-method": "error",
  },
};