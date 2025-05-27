import { ESLintUtils } from '@typescript-eslint/utils';
type MessageIds = 'noAnyType' | 'noAsAny' | 'noImplicitAny';
/**
 * ESLint rule to prevent 'any' types in test files
 * Ensures tests follow same TypeScript strictness as production code
 */
export declare const noAnyInTests: ESLintUtils.RuleModule<MessageIds, [], unknown, ESLintUtils.RuleListener>;
export {};
