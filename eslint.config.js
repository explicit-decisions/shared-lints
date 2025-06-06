// @ts-check

import sharedLints from './tools/eslint-config/src/index.js';

export default [
  ...sharedLints,
  
  // Project-specific overrides
  {
    rules: {
      // Currently no project-specific rule overrides needed
    }
  },

  // Disable rules that don't apply to infrastructure code
  {
    files: ["scripts/**", "tools/**"],
    rules: {
      "@explicit-decisions/no-npx-usage": "off",
      "@explicit-decisions/prefer-real-implementations": "off",
      "no-console": "off", // CLIs need console output
    }
  },

  // Relax strict rules for ESLint plugin source (AST processing has many false positives)
  {
    files: ["tools/eslint-plugin/src/**"],
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
    }
  },

  // Exclude reference repositories and build outputs from linting
  {
    ignores: [
      "reference-repos/**",
      "**/dist/**",
      "**/temp/**",
    ],
  }
];