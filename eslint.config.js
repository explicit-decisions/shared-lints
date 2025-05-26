// @ts-check

import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  
  {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
    },
  },

  {
    ignores: [
      "node_modules/**",
      "**/node_modules/**",
      "**/coverage/**",
    ],
  },

  prettier,
];