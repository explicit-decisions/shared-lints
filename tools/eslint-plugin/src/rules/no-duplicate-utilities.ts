/**
 * Rule: no-duplicate-utilities
 * 
 * Detects functions with similar signatures and names that likely duplicate functionality,
 * suggesting copy-paste programming without consolidation.
 */

import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 'duplicateUtility';

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md#${name}`
);

interface FunctionInfo {
  node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression;
  name: string;
  paramCount: number;
  pattern: string;
}

export const noDuplicateUtilities = createRule<[], MessageIds>({
  name: 'no-duplicate-utilities',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Detect functions that appear to duplicate functionality based on similar signatures',
    },
    schema: [],
    messages: {
      duplicateUtility: 'This function appears to duplicate functionality of "{{similar}}". Consider consolidating these utilities.',
    },
  },
  defaultOptions: [],

  create(context) {
    const functionSignatures: FunctionInfo[] = [];

    function extractFunctionName(node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression): string | null {
      if (node.type === AST_NODE_TYPES.FunctionDeclaration && node.id) {
        return node.id.name;
      }
      
      // For function expressions, check if assigned to a variable
      if (node.type === AST_NODE_TYPES.FunctionExpression && node.parent) {
        if (node.parent.type === AST_NODE_TYPES.VariableDeclarator && 
            node.parent.id.type === AST_NODE_TYPES.Identifier) {
          return node.parent.id.name;
        }
        // Check if it's a method in an object
        if (node.parent.type === AST_NODE_TYPES.Property && 
            node.parent.key.type === AST_NODE_TYPES.Identifier) {
          return node.parent.key.name;
        }
      }
      
      return null;
    }

    function normalizePattern(name: string): string {
      // Convert camelCase/PascalCase to snake_case for comparison
      return name
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
        .toLowerCase();
    }

    function areSimilarFunctions(func1: FunctionInfo, func2: FunctionInfo): boolean {
      // Same parameter count is required
      if (func1.paramCount !== func2.paramCount) {
        return false;
      }

      const pattern1 = func1.pattern.split('_');
      const pattern2 = func2.pattern.split('_');

      // Similar length patterns
      if (Math.abs(pattern1.length - pattern2.length) > 1) {
        return false;
      }

      // Count matching segments
      let matches = 0;
      const minLength = Math.min(pattern1.length, pattern2.length);
      
      for (let i = 0; i < minLength; i++) {
        if (pattern1[i] === pattern2[i]) {
          matches++;
        }
      }

      // Consider similar if most parts match (e.g., validateUser vs validateCompany)
      return matches >= minLength - 1 && minLength > 1;
    }

    function checkForDuplicates(node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression): void {
      const name = extractFunctionName(node);
      if (!name) return;

      const pattern = normalizePattern(name);
      const paramCount = node.params.length;
      const functionInfo: FunctionInfo = { node, name, paramCount, pattern };

      // Check against existing functions
      for (const existing of functionSignatures) {
        if (existing.name !== name && areSimilarFunctions(existing, functionInfo)) {
          context.report({
            node,
            messageId: 'duplicateUtility',
            data: {
              similar: existing.name,
            },
          });
          // Don't report multiple duplicates for the same function
          break;
        }
      }

      // Add to tracked functions
      functionSignatures.push(functionInfo);
    }

    return {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
        checkForDuplicates(node);
      },

      FunctionExpression(node: TSESTree.FunctionExpression): void {
        checkForDuplicates(node);
      },
    };
  },
});