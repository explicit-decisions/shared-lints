// @ts-check

import { describe, it, expect } from "vitest";

import sharedConfig from "./index.js";

describe("shared-lints ESLint config", () => {
  it("should export an array of configurations", () => {
    expect(Array.isArray(sharedConfig)).toBe(true);
    expect(sharedConfig.length).toBeGreaterThan(0);
  });

  it("should include import configuration", () => {
    const importConfig = sharedConfig.find(config => 
      config.plugins && "import-x" in config.plugins
    );
    expect(importConfig).toBeDefined();
    expect(importConfig?.rules).toBeDefined();
    expect(importConfig?.rules?.["import-x/order"]).toBeDefined();
  });

  it("should include TypeScript configuration", () => {
    const tsConfig = sharedConfig.find(config => 
      config.plugins && "@typescript-eslint" in config.plugins
    );
    expect(tsConfig).toBeDefined();
    expect(tsConfig?.files).toContain("**/*.ts");
  });

  it("should include test configuration", () => {
    const testConfig = sharedConfig.find(config => 
      config.files && config.files.includes("**/*.test.ts")
    );
    expect(testConfig).toBeDefined();
  });
});