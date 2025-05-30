/* eslint-disable @explicit-decisions/no-mocks-or-spies -- This is the rule implementation */

import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleFixer } from '@typescript-eslint/utils/ts-eslint';

type MessageIds = 'noMocks' | 'noSpies' | 'suggestRemove' | 'suggestRefactor';

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md#${name}`
);

export const noMocksOrSpies = createRule<[], MessageIds>({
  name: 'no-mocks-or-spies',
  meta: {
    type: 'suggestion', // Changed from 'problem' to 'suggestion' to better reflect the nature of this rule
    docs: {
      description: 'Disallow the use of mocking libraries and spy functions in tests',
    },
    hasSuggestions: true, // Enable suggestions instead of auto-fix
    schema: [],
    messages: {
      noMocks: 'Do not use mocks in tests. Use real implementations or dependency injection instead',
      noSpies: 'Do not use spies in tests. Use real implementations or test interfaces instead',
      suggestRemove: 'Remove this mock/spy usage',
      suggestRefactor: 'Refactor to use real implementation with dependency injection',
    },
  },
  defaultOptions: [],

  create(context) {
    // Helper function to find the statement containing a node
    function findStatement(node: TSESTree.Node): TSESTree.Node | null {
      let parent = node.parent;
      while (parent) {
        if (parent.type === AST_NODE_TYPES.ExpressionStatement ||
            parent.type === AST_NODE_TYPES.VariableDeclaration ||
            parent.type === AST_NODE_TYPES.ImportDeclaration) {
          return parent;
        }
        parent = parent.parent;
      }
      return null;
    }

    // Helper to get source text
    function getNodeText(node: TSESTree.Node): string {
      return context.sourceCode.getText(node);
    }

    return {
      CallExpression(node: TSESTree.CallExpression): void {

        const calleeText = getNodeText(node.callee);
        
        // Check for various mock patterns
        const mockPatterns = [
          /^jest\.(fn|mock|spyOn)/,
          /^vi\.(fn|mock|spyOn)/,
          /^vitest\.(fn|mock|spyOn)/,
          /^sinon\.(spy|stub|mock)/,
          /\.mockImplementation/,
          /\.mockReturnValue/,
          /\.mockResolvedValue/,
          /\.mockRejectedValue/,
        ];

        // Check for spy patterns
        const spyPatterns = [
          /spyOn/,
          /\.spy\(/,
        ];

        const isSpyPattern = spyPatterns.some(pattern => pattern.test(calleeText));
        const isMockPattern = mockPatterns.some(pattern => pattern.test(calleeText));

        if (isMockPattern || isSpyPattern) {
          const statement = findStatement(node);
          
          context.report({
            node,
            messageId: isSpyPattern ? 'noSpies' : 'noMocks',
            // Use suggestions instead of auto-fix
            suggest: [
              // Only suggest removal if we found a containing statement
              ...(statement ? [{
                messageId: 'suggestRemove' as const,
                fix(fixer: RuleFixer): ReturnType<RuleFixer['remove']> {
                  return fixer.remove(statement);
                },
              }] : []),
              // Always suggest refactoring as the preferred option (no auto-fix)
              {
                messageId: 'suggestRefactor' as const,
                fix: (): null => null, // No auto-fix - requires human judgment
              },
            ],
          });
          return;
        }
      },
      
      ImportDeclaration(node: TSESTree.ImportDeclaration): void {
        // Check for imports of mocking libraries
        const mockLibraries = [
          'sinon', '@sinon/fake-timers', 'jest-mock', 'vitest/spy'
        ];
        
        if (node.source.type === AST_NODE_TYPES.Literal && 
            typeof node.source.value === 'string' &&
            mockLibraries.includes(node.source.value)) {
          context.report({
            node,
            messageId: 'noMocks',
            suggest: [
              {
                messageId: 'suggestRemove' as const,
                fix(fixer: RuleFixer): ReturnType<RuleFixer['remove']> {
                  return fixer.remove(node);
                },
              },
              {
                messageId: 'suggestRefactor' as const,
                fix: (): null => null, // No auto-fix - requires human judgment
              },
            ],
          });
        }
      },

      VariableDeclarator(node: TSESTree.VariableDeclarator): void {
        // Check for mock assignments like: const mockFn = jest.fn()
        if (node.init && node.init.type === AST_NODE_TYPES.CallExpression) {
          const calleeText = getNodeText(node.init.callee);
          // More precise pattern matching for actual mock/spy functions
          const isMockFunction = /\b(jest|vi|vitest|sinon)\.(fn|mock|spy|stub)/.test(calleeText) ||
                                /\bmock[A-Z]/.test(calleeText) ||
                                /\bspy[A-Z]/.test(calleeText);
          if (isMockFunction) {
            const statement = findStatement(node);
            
            context.report({
              node,
              messageId: 'noMocks',
              suggest: [
                ...(statement ? [{
                  messageId: 'suggestRemove' as const,
                  fix(fixer: RuleFixer): ReturnType<RuleFixer['remove']> {
                    return fixer.remove(statement);
                  },
                }] : []),
                {
                  messageId: 'suggestRefactor' as const,
                  fix: (): null => null, // No auto-fix - requires human judgment
                },
              ],
            });
          }
        }
      },

      MemberExpression(node: TSESTree.MemberExpression): void {
        // Check for access to mock properties on imported modules
        if (node.property.type === AST_NODE_TYPES.Identifier) {
          const propName = node.property.name;
          
          // Only check for mock/spy properties on objects that look like test utilities
          const objectText = getNodeText(node.object);
          const looksLikeTestUtility = /\b(jest|vi|vitest|sinon|expect)\b/.test(objectText);
          
          if (looksLikeTestUtility && (propName === 'mock' || propName === '__mocks__' || propName === 'spy')) {
            const statement = findStatement(node);
            
            context.report({
              node,
              messageId: propName === 'spy' ? 'noSpies' : 'noMocks',
              suggest: [
                ...(statement ? [{
                  messageId: 'suggestRemove' as const,
                  fix(fixer: RuleFixer): ReturnType<RuleFixer['remove']> {
                    return fixer.remove(statement);
                  },
                }] : []),
                {
                  messageId: 'suggestRefactor' as const,
                  fix: (): null => null, // No auto-fix - requires human judgment
                },
              ],
            });
          }
        }
      },
    };
  },
});