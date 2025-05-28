import fs from 'fs';
import path from 'path';

import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { RuleFixer } from '@typescript-eslint/utils/ts-eslint';

type MessageIds = 'missingTsExtension';

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md${name}`
);

/**
 * ESLint rule to require .ts extensions when importing .ts files that exist on disk
 */
export const requireTsExtensions = createRule<[], MessageIds>({
  name: 'require-ts-extensions',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require .ts extensions when importing .ts files that exist on disk',
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingTsExtension: 'Missing .ts extension for import "{{importPath}}". Add .ts extension.',
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename || '';

    /**
     * Resolve relative import path to absolute path
     */
    const resolveImportPath = (importPath: string, fromDir: string): string => {
      if (importPath.startsWith('.')) {
        return path.resolve(fromDir, importPath);
      }
      return importPath;
    };

    /**
     * Check if a TypeScript file exists at the given path
     */
    const tsFileExists = (basePath: string): boolean => {
      const tsPath = `${basePath}.ts`;
      try {
        return fs.existsSync(tsPath) && fs.statSync(tsPath).isFile();
      } catch {
        return false;
      }
    };

    /**
     * Create auto-fix for adding .ts extension
     */
    const createFix = (node: TSESTree.Literal, importPath: string): (fixer: RuleFixer) => ReturnType<RuleFixer['replaceText']> => {
      return (fixer: RuleFixer) => {
        const newImportPath = `${importPath}.ts`;
        return fixer.replaceText(node, `"${newImportPath}"`);
      };
    };

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration): void {
        if (node.source.type === AST_NODE_TYPES.Literal && 
            typeof node.source.value === 'string') {
          
          const importPath = node.source.value;
          
          // Only check relative imports
          if (importPath.startsWith('.')) {
            // Skip if already has .ts extension
            if (importPath.endsWith('.ts')) {
              return;
            }
            
            const currentDir = path.dirname(filename);
            const resolvedPath = resolveImportPath(importPath, currentDir);
            
            if (tsFileExists(resolvedPath)) {
              context.report({
                node: node.source,
                messageId: 'missingTsExtension',
                data: { importPath },
                fix: createFix(node.source, importPath),
              });
            }
          }
        }
      },

      // Also check dynamic imports
      CallExpression(node: TSESTree.CallExpression): void {
        const calleeText = context.sourceCode.getText(node.callee);
        if (calleeText === 'import' && node.arguments.length > 0) {
          
          const firstArg = node.arguments[0];
          if (firstArg && firstArg.type === AST_NODE_TYPES.Literal && 
              typeof firstArg.value === 'string') {
            
            const importPath = firstArg.value;
            
            // Only check relative imports
            if (importPath.startsWith('.')) {
              // Skip if already has .ts extension
              if (importPath.endsWith('.ts')) {
                return;
              }
              
              const currentDir = path.dirname(filename);
              const resolvedPath = resolveImportPath(importPath, currentDir);
              
              if (tsFileExists(resolvedPath)) {
                context.report({
                  node: firstArg,
                  messageId: 'missingTsExtension',
                  data: { importPath },
                  fix: createFix(firstArg, importPath),
                });
              }
            }
          }
        }
      },
    };
  },
});