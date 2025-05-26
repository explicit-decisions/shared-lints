// @ts-check

import { noMocksOrSpies } from './rules/no-mocks-or-spies.js';
import { requireTsExtensions } from './rules/require-ts-extensions.js';
import { noNpxUsage } from './rules/no-npx-usage.js';

/**
 * ESLint plugin enforcing explicit decisions for LLM-assisted development
 */
export default {
  rules: {
    'no-mocks-or-spies': noMocksOrSpies,
    'require-ts-extensions': requireTsExtensions,
    'no-npx-usage': noNpxUsage,
  },
};