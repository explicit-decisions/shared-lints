/**
 * Rule: prefer-private-fields
 * 
 * Enforces use of private fields (#field) over TypeScript private keyword.
 * Private fields are a native JavaScript feature with better encapsulation.
 */

import type { Rule } from 'eslint';

export const preferPrivateFields: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer private fields (#field) over TypeScript private keyword',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferPrivateFields: 'Use private fields (#{{name}}) instead of TypeScript private keyword. Private fields provide true encapsulation and work at runtime.',
    },
  },

  create(context: Rule.RuleContext) {
    return {
      PropertyDefinition(node: any) {
        // Check for TypeScript private keyword on class properties
        if (node.accessibility === 'private') {
          const propertyName = node.key.name;
          
          context.report({
            node,
            messageId: 'preferPrivateFields',
            data: { name: propertyName },
            fix(fixer) {
              // Remove 'private' keyword and add # prefix to field name
              const privateKeyword = node.modifiers?.find((modifier: any) => modifier.type === 'TSPrivateKeyword');
              
              if (privateKeyword && propertyName) {
                return [
                  // Remove 'private' keyword
                  fixer.remove(privateKeyword),
                  // Add # prefix to property name
                  fixer.replaceText(node.key, `#${propertyName}`)
                ];
              }
              return null;
            },
          });
        }
      },

      MethodDefinition(node: any) {
        // Check for TypeScript private keyword on class methods
        if (node.accessibility === 'private') {
          const methodName = node.key.name;
          
          context.report({
            node,
            messageId: 'preferPrivateFields',
            data: { name: methodName },
            fix(fixer) {
              // Remove 'private' keyword and add # prefix to method name
              const privateKeyword = node.modifiers?.find((modifier: any) => modifier.type === 'TSPrivateKeyword');
              
              if (privateKeyword && methodName) {
                return [
                  // Remove 'private' keyword
                  fixer.remove(privateKeyword),
                  // Add # prefix to method name
                  fixer.replaceText(node.key, `#${methodName}`)
                ];
              }
              return null;
            },
          });
        }
      },
    };
  },
};