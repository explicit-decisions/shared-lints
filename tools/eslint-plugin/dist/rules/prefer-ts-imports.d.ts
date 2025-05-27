import { ESLintUtils } from '@typescript-eslint/utils';
/**
 * ESLint rule: prefer-ts-imports
 *
 * Part of the "Enforced Explicit Decision" pattern for LLM-assisted development.
 *
 * Enforces explicit decisions about file extensions by preferring .ts imports
 * when TypeScript files exist instead of .js imports. This prevents implicit
 * assumptions about file types and ensures clear intent.
 *
 * Features:
 * - Auto-fixes .js imports to .ts when TypeScript files exist
 * - Handles ES6 imports, dynamic imports, require(), and export statements
 * - Supports relative path resolution
 * - Handles directory imports with index.ts files
 */
export declare const preferTsImports: ESLintUtils.RuleModule<"preferTsImport", [], unknown, ESLintUtils.RuleListener>;
export default preferTsImports;
//# sourceMappingURL=prefer-ts-imports.d.ts.map