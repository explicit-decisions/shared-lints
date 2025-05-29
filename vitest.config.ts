import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.{js,ts}", "tools/**/src/**/*.test.{js,ts}"],
    exclude: ["reference-repos/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/node_modules/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        "reference-repos/**",
      ],
    },
  },
});