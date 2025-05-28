// @ts-check

import { describe, it, expect } from "vitest";

import explicitConfig from "./index.js";

describe("explicit-decisions ESLint config", () => {
  it("should export an array of configurations", () => {
    expect(Array.isArray(explicitConfig)).toBe(true);
    expect(explicitConfig.length).toBeGreaterThan(0);
  });

  it("should include import configuration", () => {
    const importConfig = explicitConfig.find(config => 
      config.plugins && "import-x" in config.plugins
    );
    expect(importConfig).toBeDefined();
    expect(importConfig?.rules).toBeDefined();
    expect(importConfig?.rules?.["import-x/order"]).toBeDefined();
  });

  it("should include TypeScript configuration", () => {
    const tsConfig = explicitConfig.find(config => 
      config.plugins && "@typescript-eslint" in config.plugins
    );
    expect(tsConfig).toBeDefined();
    expect(tsConfig?.files).toContain("**/*.ts");
  });

  it("should include test configuration", () => {
    const testConfig = explicitConfig.find(config => 
      config.files && config.files.includes("**/*.test.ts")
    );
    expect(testConfig).toBeDefined();
  });
});