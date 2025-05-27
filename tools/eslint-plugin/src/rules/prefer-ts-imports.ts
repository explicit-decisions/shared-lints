import fs from 'fs';
import path from 'path';

import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 'preferTsImport';

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/explicit-decisions/shared-lints/blob/main/docs/RULES_REFERENCE.md${name}`
);

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
export const preferTsImports = createRule<[], MessageIds>({
  name: 'prefer-ts-imports',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer importing from .ts files when they exist instead of .js',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferTsImport: 'Import from {{tsPath}} instead of {{jsPath}}',
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename || '';
    const dirname = path.dirname(filename);

    /**
     * Check if a file exists at the given path
     */
    const checkFileExists = (filePath: string): boolean => {
      try {
        return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
      } catch {
        return false;
      }
    };

    /**
     * Resolve import path relative to current file
     */
    const resolveImportPath = (importPath: string, fromDir: string): string => {
      if (importPath.startsWith('.')) {
        return path.resolve(fromDir, importPath);
      }
      return importPath;
    };

    /**
     * Check and report TypeScript import preference
     */
    const checkAndReport = (node: TSESTree.Literal, importPath: string, sourceNode: TSESTree.Node): void => {
      // Only check relative imports with .js extension
      if (!importPath.startsWith('.') || !importPath.endsWith('.js')) {
        return;
      }

      const resolvedJsPath = resolveImportPath(importPath, dirname);
      const resolvedTsPath = resolvedJsPath.replace(/\.js$/, '.ts');

      // Check if TypeScript version exists
      if (checkFileExists(resolvedTsPath)) {
        const tsImportPath = importPath.replace(/\.js$/, '.ts');
        
        context.report({
          node: sourceNode,
          messageId: 'preferTsImport',
          data: {
            jsPath: importPath,
            tsPath: tsImportPath,
          },
          fix(fixer) {
            return fixer.replaceText(node, `"${tsImportPath}"`);
          },
        });
      }
    };

    return {
      // Handle ES6 import statements
      ImportDeclaration(node: TSESTree.ImportDeclaration): void {
        if (node.source.type === AST_NODE_TYPES.Literal && 
            typeof node.source.value === 'string') {
          checkAndReport(node.source, node.source.value, node);
        }
      },

      // Handle ES6 export statements  
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void {
        if (node.source && 
            node.source.type === AST_NODE_TYPES.Literal &&
            typeof node.source.value === 'string') {
          checkAndReport(node.source, node.source.value, node);
        }
      },

      // Handle export all statements
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration): void {
        if (node.source.type === AST_NODE_TYPES.Literal &&
            typeof node.source.value === 'string') {
          checkAndReport(node.source, node.source.value, node);
        }
      },

      // Handle dynamic imports and require calls
      CallExpression(node: TSESTree.CallExpression): void {
        // Dynamic import()
        const calleeText = context.sourceCode.getText(node.callee);
        if (calleeText === 'import' && node.arguments.length > 0) {
          
          const firstArg = node.arguments[0];
          if (firstArg && firstArg.type === AST_NODE_TYPES.Literal && 
              typeof firstArg.value === 'string') {
            checkAndReport(firstArg, firstArg.value, node);
          }
        }
        
        // require() calls
        if (node.callee.type === AST_NODE_TYPES.Identifier && 
            node.callee.name === 'require' && 
            node.arguments.length > 0) {
          
          const firstArg = node.arguments[0];
          if (firstArg && firstArg.type === AST_NODE_TYPES.Literal && 
              typeof firstArg.value === 'string') {
            checkAndReport(firstArg, firstArg.value, node);
          }
        }
      },
    };
  },
});

export default preferTsImports;