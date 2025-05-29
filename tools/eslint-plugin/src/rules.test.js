// @ts-check

import { describe, it, expect } from "vitest";
import { RuleTester } from "@typescript-eslint/rule-tester";

import { noMocksOrSpies } from "./rules/no-mocks-or-spies.ts";
import { noNpxUsage } from "./rules/no-npx-usage.ts";

// Configure rule tester for modern ESLint/TypeScript
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

describe("ESLint Rules", () => {
  describe("no-mocks-or-spies", () => {
    it("should catch mocking violations in test files", () => {
      ruleTester.run("no-mocks-or-spies", noMocksOrSpies, {
        valid: [
          {
            code: 'const service = new UserService();',
            filename: 'test.spec.js'
          },
          {
            code: 'expect(result).toBe(true);',
            filename: 'user.test.ts'
          },
          {
            code: 'jest.mock("./module");', // Should be allowed in non-test files
            filename: 'src/index.js'
          }
        ],
        invalid: [
          {
            code: 'jest.mock("./userService");',
            filename: 'user.test.js',
            errors: [{ messageId: 'noMocks' }]
          },
          {
            code: 'const spy = jest.spyOn(obj, "method");',
            filename: 'component.spec.ts',
            errors: [{ messageId: 'noSpies' }]
          }
        ]
      });
    });
  });

  describe("no-npx-usage", () => {
    it("should catch npx usage violations", () => {
      ruleTester.run("no-npx-usage", noNpxUsage, {
        valid: [
          {
            code: 'exec("pnpm install");',
            filename: 'setup.js'
          },
          {
            code: 'console.log("npx is mentioned in a string");',
            filename: 'docs.js'
          }
        ],
        invalid: [
          {
            code: 'exec("npx create-react-app my-app");',
            filename: 'setup.js',
            errors: [{ messageId: 'noNpx' }]
          }
        ]
      });
    });
  });
});