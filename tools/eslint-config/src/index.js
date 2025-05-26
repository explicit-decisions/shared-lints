// @ts-check

/**
 * @typedef {import('eslint').Linter.FlatConfig} FlatConfig
 */

import prettier from "eslint-config-prettier";

import { importConfig } from "./base.js";
import { strictTypeScriptConfig } from "./strict.js";
import { testConfig } from "./test.js";

/**
 * Default shared ESLint configuration
 * Includes import rules, strict TypeScript rules, test rules, and Prettier
 * @type {FlatConfig[]}
 */
const sharedConfig = [
  // Import rules (applied to all files)
  importConfig,

  // Strict TypeScript configuration
  strictTypeScriptConfig,

  // Test file configuration
  testConfig,

  // Ignore patterns for specific files and directories
  {
    ignores: [
      "node_modules/**",
      "**/node_modules/**",
      "**/coverage/**",
      "*.config.js",
      "*.mjs",
      "*.cjs",
      "eslint.config.js",
    ],
  },

  // Apply Prettier config at the end to override formatting rules
  prettier,
];

export default sharedConfig;