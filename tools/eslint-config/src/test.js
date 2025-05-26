// @ts-check

/**
 * @typedef {import('eslint').Linter.Config} ESLintConfig
 */

import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

/**
 * Test file configuration - more lenient rules for test files
 * @type {ESLintConfig}
 */
export const testConfig = {
  files: ["**/*.test.ts", "**/*.spec.ts", "tests/**/*.ts"],
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
    // Less strict TypeScript rules for tests
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/unbound-method": "warn",
  },
};