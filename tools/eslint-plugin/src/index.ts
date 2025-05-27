// TypeScript version of the ESLint plugin index
import { noAnyInTests } from './rules/no-any-in-tests.ts';
import { noMocksOrSpies } from './rules/no-mocks-or-spies.ts';
import { noNpxUsage } from './rules/no-npx-usage.ts';
import { preferRealImplementations } from './rules/prefer-real-implementations.ts';
import { preferTsImports } from './rules/prefer-ts-imports.ts';
import { requireFactoryFunctions } from './rules/require-factory-functions.ts';
import { requireTsExtensions } from './rules/require-ts-extensions.ts';

/**
 * ESLint plugin enforcing explicit decisions for LLM-assisted development
 * Full TypeScript implementation
 */
export default {
  rules: {
    'no-any-in-tests': noAnyInTests,
    'no-mocks-or-spies': noMocksOrSpies,
    'no-npx-usage': noNpxUsage,
    'prefer-real-implementations': preferRealImplementations,
    'prefer-ts-imports': preferTsImports,
    'require-factory-functions': requireFactoryFunctions,
    'require-ts-extensions': requireTsExtensions,
  },
};