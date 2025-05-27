// @ts-check

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('eslint').Rule.RuleFixer} RuleFixer
 * @typedef {import('eslint').Rule.Node} ESLintNode
 */

/**
 * ESLint rule to encourage factory functions for test data creation
 * Promotes no-mocks testing philosophy with structured test data
 * @type {RuleModule}
 */
export const requireFactoryFunctions = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage factory functions for test data instead of inline object literals',
      category: 'Best Practices', 
      recommended: false,
    },
    fixable: undefined, // Factory function extraction should be done manually
    schema: [],
    messages: {
      useFactory: 'Consider using a factory function for complex test data. Create a factory in test-utils/ for reusable test data creation.',
      extractFactory: 'Large object literal detected in test. Consider extracting to a factory function for better maintainability.',
    },
  },
  /**
   * @param {RuleContext} context
   */
  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? ''
    const isTestFile = /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filename);
    
    if (!isTestFile) {
      return {};
    }

    /**
     * Count properties in an object expression
     * @param {ESLintNode} node
     * @returns {number}
     */
    function countObjectProperties(node) {
      if (node.type !== 'ObjectExpression') return 0;
      return node.properties.length;
    }

    /**
     * Check if object has nested objects
     * @param {ESLintNode} node
     * @returns {boolean}
     */
    function hasNestedObjects(node) {
      if (node.type !== 'ObjectExpression') return false;
      return node.properties.some(prop => 
        prop.type === 'Property' && 
        prop.value.type === 'ObjectExpression'
      );
    }

    return {
      /**
       * @param {ESLintNode} node
       */
      ObjectExpression(node) {
        const propertyCount = countObjectProperties(node);
        const hasNested = hasNestedObjects(node);
        
        // Flag objects with >5 properties or nested objects as candidates for factories
        if (propertyCount > 5 || hasNested) {
          const isInVariableDeclarator = node.parent?.type === 'VariableDeclarator';
          const isInCallExpression = node.parent?.type === 'CallExpression';
          
          // Only suggest for test data, not for test configuration
          if (isInVariableDeclarator || isInCallExpression) {
            context.report({
              node,
              messageId: propertyCount > 8 ? 'extractFactory' : 'useFactory',
            });
          }
        }
      },

      /**
       * @param {ESLintNode} node
       */
      ArrayExpression(node) {
        // Check for arrays of objects that could benefit from factories
        if (node.type === 'ArrayExpression' && node.elements && node.elements.length > 3) {
          const hasObjectElements = node.elements.some((el) => 
            el && el.type === 'ObjectExpression'
          );
          
          if (hasObjectElements) {
            context.report({
              node,
              messageId: 'useFactory',
            });
          }
        }
      },
    };
  },
};