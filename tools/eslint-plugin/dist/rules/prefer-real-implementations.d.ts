import { ESLintUtils } from '@typescript-eslint/utils';
type MessageIds = 'injectDependency' | 'useRealImplementation' | 'extractInterface';
export interface Options {
    allowedGlobals?: string[];
}
/**
 * ESLint rule to encourage dependency injection and real implementations
 * Promotes testable architectures over hard-coded dependencies
 */
export declare const preferRealImplementations: ESLintUtils.RuleModule<MessageIds, [Options], unknown, ESLintUtils.RuleListener>;
export {};
//# sourceMappingURL=prefer-real-implementations.d.ts.map