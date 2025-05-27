// @ts-check

import explicitDecisions from './tools/eslint-config/src/index.js';

export default [
  ...explicitDecisions,
  
  // Project-specific overrides
  {
    rules: {
      // Add any project-specific rule overrides here
    }
  },

  // Disable no-npx-usage in scripts and tooling since they contain examples
  {
    files: ["scripts/**", "tools/**"],
    rules: {
      "@explicit-decisions/no-npx-usage": "off",
    }
  },

  // Exclude reference repositories from linting
  {
    ignores: [
      "reference-repos/**",
    ],
  }
];