// @ts-check

import { noAnyInTests } from './rules/no-any-in-tests.js';
import { noMocksOrSpies } from './rules/no-mocks-or-spies.js';
import { noNpxUsage } from './rules/no-npx-usage.js';
import { preferRealImplementations } from './rules/prefer-real-implementations.js';
import preferTsImports from './rules/prefer-ts-imports.js';
import { requireFactoryFunctions } from './rules/require-factory-functions.js';
import { requireTsExtensions } from './rules/require-ts-extensions.js';

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