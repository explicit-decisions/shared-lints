import { ESLintUtils } from '@typescript-eslint/utils';
/**
 * ESLint rule to require .ts extensions when importing .ts files that exist on disk
 */
export declare const requireTsExtensions: ESLintUtils.RuleModule<"missingTsExtension", [], unknown, ESLintUtils.RuleListener>;
