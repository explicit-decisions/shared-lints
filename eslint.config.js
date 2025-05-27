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

  // Disable rules that don't apply to infrastructure code
  {
    files: ["scripts/**", "tools/**"],
    rules: {
      "@explicit-decisions/no-npx-usage": "off",
      "@explicit-decisions/prefer-real-implementations": "off",
    }
  },

  // Exclude reference repositories from linting
  {
    ignores: [
      "reference-repos/**",
    ],
  }
];