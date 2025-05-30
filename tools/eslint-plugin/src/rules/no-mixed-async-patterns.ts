/**
 * Rule: no-mixed-async-patterns
 * 
 * Detects when different async patterns (callbacks, promises, async/await) are mixed
 * within the same file, suggesting inconsistent coding practices.
 */

import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 'mixedAsyncPatterns';

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md#${name}`
);

export const noMixedAsyncPatterns = createRule<[], MessageIds>({
  name: 'no-mixed-async-patterns',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow mixing callbacks, promises, and async/await in the same file',
    },
    schema: [],
    messages: {
      mixedAsyncPatterns: 'Mixing {{patterns}} async patterns in the same file. Choose one pattern and use it consistently.',
    },
  },
  defaultOptions: [],

  create(context) {
    const asyncPatterns = new Set<string>();
    const patternLocations = new Map<string, TSESTree.Node>();

    function checkAsyncPattern(node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression): void {
      // Detect async/await pattern
      if (node.async) {
        asyncPatterns.add('async-await');
        patternLocations.set('async-await', node);
        return;
      }

      // Check for callback pattern - last parameter named cb, callback, done, next, etc.
      if (node.params && node.params.length > 0) {
        const lastParam = node.params[node.params.length - 1];
        if (lastParam && lastParam.type === AST_NODE_TYPES.Identifier) {
          const paramName = lastParam.name.toLowerCase();
          if (['cb', 'callback', 'done', 'next', 'err'].includes(paramName) || 
              /^(on|handle)[A-Z]/.test(lastParam.name)) {
            asyncPatterns.add('callbacks');
            patternLocations.set('callbacks', node);
          }
        }
      }

      // Check for promise pattern in function body
      if (node.body) {
        let hasPromiseReturn = false;
        
        // Simple check for return statements with .then()
        if (node.body.type === AST_NODE_TYPES.BlockStatement) {
          for (const statement of node.body.body) {
            if (statement.type === AST_NODE_TYPES.ReturnStatement && 
                statement.argument?.type === AST_NODE_TYPES.CallExpression) {
              const sourceCode = context.sourceCode.getText(statement.argument);
              if (sourceCode.includes('.then(') || sourceCode.includes('Promise.')) {
                hasPromiseReturn = true;
                break;
              }
            }
          }
        }

        if (hasPromiseReturn) {
          asyncPatterns.add('promises');
          patternLocations.set('promises', node);
        }
      }
    }

    return {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
        checkAsyncPattern(node);
      },

      FunctionExpression(node: TSESTree.FunctionExpression): void {
        checkAsyncPattern(node);
      },

      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void {
        checkAsyncPattern(node);
      },

      'Program:exit'(): void {
        if (asyncPatterns.size > 1) {
          const patterns = Array.from(asyncPatterns).sort().join(' and ');
          
          // Report at the first occurrence of each pattern
          for (const [, node] of patternLocations) {
            context.report({
              node,
              messageId: 'mixedAsyncPatterns',
              data: {
                patterns,
              },
            });
          }
        }
      }
    };
  },
});