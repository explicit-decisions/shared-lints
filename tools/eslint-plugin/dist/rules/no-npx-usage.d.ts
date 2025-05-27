import { ESLintUtils } from '@typescript-eslint/utils';
type MessageIds = 'noNpx' | 'noPnpx' | 'noNpxInExecSync' | 'noPnpxInExecSync';
/**
 * ESLint rule to disallow npx/pnpx usage in favor of explicit pnpm exec
 * Enforces explicit package management and prevents arbitrary code execution
 */
export declare const noNpxUsage: ESLintUtils.RuleModule<MessageIds, [], unknown, ESLintUtils.RuleListener>;
export {};
//# sourceMappingURL=no-npx-usage.d.ts.map