import { ESLintUtils } from '@typescript-eslint/utils';
type MessageIds = 'noMocks' | 'noSpies';
/**
 * ESLint rule to prevent using mocks and spies in tests
 * Promotes no-mocks testing philosophy with real implementations
 */
export declare const noMocksOrSpies: ESLintUtils.RuleModule<MessageIds, [], unknown, ESLintUtils.RuleListener>;
export {};
