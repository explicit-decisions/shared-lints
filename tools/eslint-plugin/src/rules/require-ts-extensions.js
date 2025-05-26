// @ts-check

import fs from 'fs';
import path from 'path';

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('eslint').Rule.RuleFixer} RuleFixer
 * @typedef {import('eslint').Rule.Node} ESLintNode
 */

/**
 * ESLint rule to require .ts extensions when importing .ts files that exist on disk
 * @type {RuleModule}
 */
export const requireTsExtensions = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require .ts extensions when importing .ts files that exist on disk',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingTsExtension: 'Missing .ts extension for import "{{importPath}}". Add .ts extension.',
    },
  },
  /**
   * @param {RuleContext} context
   */
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const currentDir = path.dirname(filename);

    /**
     * @param {string} importPath
     * @param {string} currentDir
     * @returns {string | null}
     */
    function resolveImportPath(importPath, currentDir) {
      if (importPath.startsWith('.')) {
        return path.resolve(currentDir, importPath);
      }
      return null; // Only handle relative imports
    }

    /**
     * @param {string} basePath
     * @param {string} extension
     * @returns {boolean}
     */
    function fileExistsWithExtension(basePath, extension) {
      try {
        return fs.existsSync(basePath + extension);
      } catch {
        return false;
      }
    }

    return {
      /**
       * @param {ESLintNode} node
       */
      ImportDeclaration(node) {
        if (node.type !== 'ImportDeclaration' || !node.source || typeof node.source.value !== 'string') return;
        const importPath = node.source.value;
        
        // Only check relative imports
        if (!importPath.startsWith('.')) {
          return;
        }

        // Skip if already has .ts extension
        if (importPath.endsWith('.ts')) {
          return;
        }

        // Skip if has other extension
        if (path.extname(importPath)) {
          return;
        }

        const resolvedPath = resolveImportPath(importPath, currentDir);
        if (resolvedPath && fileExistsWithExtension(resolvedPath, '.ts') && node.source) {
          context.report({
            node: node.source,
            messageId: 'missingTsExtension',
            data: {
              importPath,
            },
            /**
             * @param {RuleFixer} fixer
             */
            fix(fixer) {
              if (!node.source) return null;
              return fixer.replaceText(node.source, `"${importPath}.ts"`);
            },
          });
        }
      },

      /**
       * @param {ESLintNode} node
       */
      ExportDeclaration(node) {
        if ((node.type !== 'ExportAllDeclaration' && node.type !== 'ExportNamedDeclaration') || !node.source || typeof node.source.value !== 'string') return;
        const importPath = node.source.value;
        
        // Only check relative imports
        if (!importPath.startsWith('.')) {
          return;
        }

        // Skip if already has .ts extension
        if (importPath.endsWith('.ts')) {
          return;
        }

        // Skip if has other extension
        if (path.extname(importPath)) {
          return;
        }

        const resolvedPath = resolveImportPath(importPath, currentDir);
        if (resolvedPath && fileExistsWithExtension(resolvedPath, '.ts') && node.source) {
          context.report({
            node: node.source,
            messageId: 'missingTsExtension',
            data: {
              importPath,
            },
            /**
             * @param {RuleFixer} fixer
             */
            fix(fixer) {
              if (!node.source) return null;
              return fixer.replaceText(node.source, `"${importPath}.ts"`);
            },
          });
        }
      },
    };
  },
};