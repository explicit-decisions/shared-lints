/**
 * Rule: no-inconsistent-patterns
 * 
 * Detects when the same problem is solved in multiple different ways within
 * a codebase, suggesting copy-paste or pattern-matching without understanding.
 * This is a common LLM "vibe coding" pattern.
 */

import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 
  | 'inconsistentAsync' 
  | 'inconsistentImport' 
  | 'duplicateUtility' 
  | 'unnecessaryPolyfill';

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md${name}`
);

export const noInconsistentPatterns = createRule<[], MessageIds>({
  name: 'no-inconsistent-patterns',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Detect inconsistent solutions to the same problem, suggesting cargo-cult programming',
    },
    schema: [],
    messages: {
      inconsistentAsync: 'Inconsistent async pattern. This file uses {{current}} but other files use {{others}}. Pick one pattern and stick to it.',
      inconsistentImport: 'Inconsistent import style. This file uses {{current}} but other files use {{others}}. Be consistent.',
      duplicateUtility: 'This function appears to duplicate functionality of {{similar}}. Consider consolidating.',
      unnecessaryPolyfill: 'Using {{pattern}} when {{modern}} is available. This suggests copy-paste from old code.',
    },
  },
  defaultOptions: [],

  create(context) {
    // Track patterns across the file
    const asyncPatterns = new Set<string>();
    const importPatterns = new Set<string>();
    const functionSignatures = new Map<string, TSESTree.FunctionDeclaration>();

    return {
      // Detect async pattern inconsistencies
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
        checkAsyncPattern(node);
        checkDuplicateFunction(node);
      },

      FunctionExpression(node: TSESTree.FunctionExpression): void {
        checkAsyncPattern(node);
      },

      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void {
        checkAsyncPattern(node);
      },

      // Detect import pattern inconsistencies
      ImportDeclaration(node: TSESTree.ImportDeclaration): void {
        if (node.source.value.startsWith('.')) {
          const hasExtension = /\.(js|ts|mjs|cjs)$/.test(node.source.value);
          importPatterns.add(hasExtension ? 'with-extension' : 'without-extension');
        }
      },

      // Detect old patterns that have modern replacements
      MemberExpression(node: TSESTree.MemberExpression): void {
        checkForPolyfills(node);
      },

      // Check after traversing the whole file
      'Program:exit'(): void {
        // Report inconsistent async patterns
        if (asyncPatterns.size > 1) {
          const patterns = Array.from(asyncPatterns);
          context.report({
            node: context.getSourceCode().ast as TSESTree.Program,
            messageId: 'inconsistentAsync',
            data: {
              current: patterns[0] ?? 'unknown',
              others: patterns.slice(1).join(', ')
            }
          });
        }

        // Report inconsistent import patterns
        if (importPatterns.size > 1) {
          context.report({
            node: context.getSourceCode().ast as TSESTree.Program,
            messageId: 'inconsistentImport',
            data: {
              current: Array.from(importPatterns)[0] ?? 'unknown',
              others: Array.from(importPatterns).slice(1).join(', ')
            }
          });
        }
      }
    };

    function checkAsyncPattern(node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression): void {
      // Detect different async patterns
      if (node.async) {
        asyncPatterns.add('async-await');
      } else if (node.body && containsPromisePattern(node.body)) {
        asyncPatterns.add('promises');
      } else if (node.params && node.params.length > 0) {
        const lastParam = node.params[node.params.length - 1];
        if (lastParam && lastParam.type === AST_NODE_TYPES.Identifier && 
            /^(cb|callback|done)$/i.test(lastParam.name)) {
          asyncPatterns.add('callbacks');
        }
      }
    }

    function containsPromisePattern(node: TSESTree.Node): boolean {
      let hasPromise = false;
      
      // Simple traversal looking for .then() or Promise constructor
      JSON.stringify(node, (_key, value) => {
        if (value && typeof value === 'object' && 'type' in value) {
          if (value.type === AST_NODE_TYPES.MemberExpression && 
              value.property && 
              value.property.type === AST_NODE_TYPES.Identifier &&
              value.property.name === 'then') {
            hasPromise = true;
          }
          if (value.type === AST_NODE_TYPES.NewExpression && 
              value.callee && 
              value.callee.type === AST_NODE_TYPES.Identifier &&
              value.callee.name === 'Promise') {
            hasPromise = true;
          }
        }
        return value;
      });
      
      return hasPromise;
    }

    function checkDuplicateFunction(node: TSESTree.FunctionDeclaration): void {
      if (!node.id) return;
      
      const name = node.id.name;
      const paramCount = node.params.length;
      
      // Create a signature based on name pattern and param count
      const basePattern = name.replace(/[A-Z]/g, '_$&').toLowerCase();
      const signature = `${basePattern}:${paramCount}`;
      
      // Check if we've seen a similar function
      for (const [existing, existingNode] of functionSignatures) {
        if (existing !== signature && areSimilarSignatures(existing, signature)) {
          context.report({
            node,
            messageId: 'duplicateUtility',
            data: {
              similar: existingNode.id?.name ?? 'unknown'
            }
          });
        }
      }
      
      functionSignatures.set(signature, node);
    }

    function areSimilarSignatures(sig1: string, sig2: string): boolean {
      const parts1 = sig1.split(':');
      const parts2 = sig2.split(':');
      const pattern1 = parts1[0];
      const pattern2 = parts2[0];
      const params1 = parts1[1];
      const params2 = parts2[1];
      
      // Same param count and similar names (like validate_user vs validate_company)
      if (params1 === params2 && pattern1 && pattern2) {
        const words1 = pattern1.split('_');
        const words2 = pattern2.split('_');
        
        // If they share the same prefix/suffix pattern
        if (words1.length === words2.length && words1.length > 1) {
          const sameParts = words1.filter((w, i) => w === words2[i]).length;
          return sameParts >= words1.length - 1; // All but one word matches
        }
      }
      
      return false;
    }

    function checkForPolyfills(node: TSESTree.MemberExpression): void {
      // Detect __dirname polyfill
      if (node.object.type === AST_NODE_TYPES.Identifier && 
          node.object.name === 'path' && 
          node.property.type === AST_NODE_TYPES.Identifier &&
          node.property.name === 'dirname') {
        // Check if it's part of the old fileURLToPath pattern
        const parent = node.parent;
        if (parent && parent.type === AST_NODE_TYPES.CallExpression && 
            parent.arguments.length > 0) {
          const arg = parent.arguments[0];
          if (arg && arg.type === AST_NODE_TYPES.CallExpression && 
              arg.callee.type === AST_NODE_TYPES.Identifier &&
              arg.callee.name === 'fileURLToPath') {
            const grandParent = parent.parent;
            if (grandParent) {
              context.report({
                node: grandParent,
                messageId: 'unnecessaryPolyfill',
                data: {
                  pattern: '__dirname = dirname(fileURLToPath(...))',
                  modern: 'import.meta.dirname'
                }
              });
            }
          }
        }
      }

      // Detect Promise.resolve().then() pattern (should be async/await)
      if (node.property.type === AST_NODE_TYPES.Identifier &&
          node.property.name === 'resolve' &&
          node.object.type === AST_NODE_TYPES.Identifier &&
          node.object.name === 'Promise') {
        const parent = node.parent;
        if (parent?.parent && 
            parent.parent.type === AST_NODE_TYPES.MemberExpression &&
            parent.parent.property.type === AST_NODE_TYPES.Identifier && 
            parent.parent.property.name === 'then') {
          context.report({
            node: parent.parent,
            messageId: 'unnecessaryPolyfill',
            data: {
              pattern: 'Promise.resolve().then()',
              modern: 'async/await'
            }
          });
        }
      }
    }
  },
});