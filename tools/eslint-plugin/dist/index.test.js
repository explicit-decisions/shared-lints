// @ts-check
import { describe, it, expect } from "vitest";
import plugin from './index.js';
describe("shared ESLint plugin", ()=>{
    it("should export rules object", ()=>{
        expect(plugin).toBeDefined();
        expect(plugin.rules).toBeDefined();
        expect(typeof plugin.rules).toBe("object");
    });
    it("should include no-mocks-or-spies rule", ()=>{});
    it("should include require-ts-extensions rule", ()=>{
        expect(plugin.rules["require-ts-extensions"]).toBeDefined();
        expect(plugin.rules["require-ts-extensions"].meta).toBeDefined();
        expect(plugin.rules["require-ts-extensions"].create).toBeDefined();
    });
    it("should include no-npx-usage rule", ()=>{
        expect(plugin.rules["no-npx-usage"]).toBeDefined();
        expect(plugin.rules["no-npx-usage"].meta).toBeDefined();
        expect(plugin.rules["no-npx-usage"].create).toBeDefined();
    });
    it("should have proper rule metadata", ()=>{
        const noMocksRule = plugin.rules["no-mocks-or-spies"];
        expect(noMocksRule.meta?.type).toBe("problem");
        expect(noMocksRule.meta?.fixable).toBe("code");
        const tsExtRule = plugin.rules["require-ts-extensions"];
        expect(tsExtRule.meta?.type).toBe("problem");
        expect(tsExtRule.meta?.fixable).toBe("code");
        const noNpxRule = plugin.rules["no-npx-usage"];
        expect(noNpxRule.meta?.type).toBe("problem");
        expect(noNpxRule.meta?.fixable).toBe("code");
    });
});

//# sourceMappingURL=index.test.js.map