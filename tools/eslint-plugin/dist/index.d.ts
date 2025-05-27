/**
 * ESLint plugin enforcing explicit decisions for LLM-assisted development
 * Full TypeScript implementation
 */
declare const plugin: {
    rules: {
        'no-any-in-tests': import("@typescript-eslint/utils/ts-eslint").RuleModule<"noAnyType" | "noAsAny" | "noImplicitAny", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
        'no-mocks-or-spies': import("@typescript-eslint/utils/ts-eslint").RuleModule<"noMocks" | "noSpies", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
        'no-npx-usage': import("@typescript-eslint/utils/ts-eslint").RuleModule<"noNpx" | "noPnpx" | "noNpxInExecSync" | "noPnpxInExecSync", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
        'prefer-real-implementations': import("@typescript-eslint/utils/ts-eslint").RuleModule<"injectDependency" | "useRealImplementation" | "extractInterface", [import("./rules/prefer-real-implementations.ts").Options], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
        'prefer-ts-imports': import("@typescript-eslint/utils/ts-eslint").RuleModule<"preferTsImport", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
        'require-factory-functions': import("@typescript-eslint/utils/ts-eslint").RuleModule<"useFactory" | "extractFactory", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
        'require-ts-extensions': import("@typescript-eslint/utils/ts-eslint").RuleModule<"missingTsExtension", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
    };
};
export default plugin;
//# sourceMappingURL=index.d.ts.map