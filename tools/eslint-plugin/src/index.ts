// TypeScript version of the ESLint plugin index
import { noAnyInTests } from './rules/no-any-in-tests.js';
import { noMocksOrSpies } from './rules/no-mocks-or-spies.js';
import { noNpxUsage } from './rules/no-npx-usage.js';
import { preferRealImplementations } from './rules/prefer-real-implementations.js';
import { preferTsImports } from './rules/prefer-ts-imports.js';
import { requireFactoryFunctions } from './rules/require-factory-functions.js';
import { requireTsExtensions } from './rules/require-ts-extensions.js';

// TypeScript imports
import { noAnyInTests as noAnyInTestsTS } from './rules/no-any-in-tests';
import { noMocksOrSpies as noMocksOrSpiesTS } from './rules/no-mocks-or-spies';
import { noNpxUsage as noNpxUsageTS } from './rules/no-npx-usage';
import { preferRealImplementations as preferRealImplementationsTS } from './rules/prefer-real-implementations';
import { preferTsImports as preferTsImportsTS } from './rules/prefer-ts-imports';
import { requireFactoryFunctions as requireFactoryFunctionsTS } from './rules/require-factory-functions';
import { requireTsExtensions as requireTsExtensionsTS } from './rules/require-ts-extensions';

/**
 * ESLint plugin enforcing explicit decisions for LLM-assisted development
 * Now with full TypeScript support
 */
export default {
  rules: {
    // Original JavaScript versions (maintained for compatibility)
    'no-mocks-or-spies': noMocksOrSpies,
    'require-ts-extensions': requireTsExtensions,
    'no-npx-usage': noNpxUsage,
    'prefer-ts-imports': preferTsImports,
    'require-factory-functions': requireFactoryFunctions,
    'no-any-in-tests': noAnyInTests,
    'prefer-real-implementations': preferRealImplementations,
    
    // TypeScript versions (recommended for new usage)
    'no-mocks-or-spies-ts': noMocksOrSpiesTS,
    'require-ts-extensions-ts': requireTsExtensionsTS,
    'no-npx-usage-ts': noNpxUsageTS,
    'prefer-ts-imports-ts': preferTsImportsTS,
    'require-factory-functions-ts': requireFactoryFunctionsTS,
    'no-any-in-tests-ts': noAnyInTestsTS,
    'prefer-real-implementations-ts': preferRealImplementationsTS,
  },
};