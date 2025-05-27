// @ts-check

import { noAnyInTests } from './rules/no-any-in-tests.ts';
import { noMocksOrSpies } from './rules/no-mocks-or-spies.ts';
import { noNpxUsage } from './rules/no-npx-usage.ts';
import { preferRealImplementations } from './rules/prefer-real-implementations.ts';
import preferTsImports from './rules/prefer-ts-imports.ts';
import { requireFactoryFunctions } from './rules/require-factory-functions.ts';
import { requireTsExtensions } from './rules/require-ts-extensions.ts';

/**
 * ESLint plugin enforcing explicit decisions for LLM-assisted development
 */
export default {
  rules: {
    'no-mocks-or-spies': noMocksOrSpies,
    'require-ts-extensions': requireTsExtensions,
    'no-npx-usage': noNpxUsage,
    'prefer-ts-imports': preferTsImports,
    'require-factory-functions': requireFactoryFunctions,
    'no-any-in-tests': noAnyInTests,
    'prefer-real-implementations': preferRealImplementations,
  },
};