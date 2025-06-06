// TypeScript version of the ESLint plugin index
import { noAnyInTests } from './rules/no-any-in-tests.ts';
import { noDuplicateUtilities } from './rules/no-duplicate-utilities.ts';
import { noInconsistentImportExtensions } from './rules/no-inconsistent-import-extensions.ts';
import { noMixedAsyncPatterns } from './rules/no-mixed-async-patterns.ts';
import { noMocksOrSpies } from './rules/no-mocks-or-spies.ts';
import { noNpxUsage } from './rules/no-npx-usage.ts';
import { noOutdatedPolyfills } from './rules/no-outdated-polyfills.ts';
import { preferRealImplementations } from './rules/prefer-real-implementations.ts';
import { preferTsImports } from './rules/prefer-ts-imports.ts';
import { requireFactoryFunctions } from './rules/require-factory-functions.ts';
import { requireTsExtensions } from './rules/require-ts-extensions.ts';

/**
 * ESLint plugin enforcing explicit decisions for LLM-assisted development
 * Full TypeScript implementation
 */
const plugin = {
  rules: {
    'no-any-in-tests': noAnyInTests,
    'no-duplicate-utilities': noDuplicateUtilities,
    'no-inconsistent-import-extensions': noInconsistentImportExtensions,
    'no-mixed-async-patterns': noMixedAsyncPatterns,
    'no-mocks-or-spies': noMocksOrSpies,
    'no-npx-usage': noNpxUsage,
    'no-outdated-polyfills': noOutdatedPolyfills,
    'prefer-real-implementations': preferRealImplementations,
    'prefer-ts-imports': preferTsImports,
    'require-factory-functions': requireFactoryFunctions,
    'require-ts-extensions': requireTsExtensions,
  },
};

export default plugin;