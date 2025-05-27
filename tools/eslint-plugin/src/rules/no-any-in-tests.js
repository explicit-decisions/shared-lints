// @ts-check

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('eslint').Rule.RuleFixer} RuleFixer
 * @typedef {import('eslint').Rule.Node} ESLintNode
 */

/**
 * ESLint rule to prevent 'any' types in test files
 * Ensures tests follow same TypeScript strictness as production code
 * @type {RuleModule}
 */
export const noAnyInTests = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow any types in test files to maintain type safety',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: undefined, // Type annotations can't be auto-fixed safely
    schema: [],
    messages: {
      noAnyType: 'Avoid using "any" type in tests. Use proper typing or create specific interfaces for test data.',
      noAsAny: 'Avoid using "as any" type assertions in tests. Use proper type guards or specific interfaces.',
      noImplicitAny: 'Add explicit type annotation. Tests should follow the same TypeScript strictness as production code.',
    },
  },
  /**
   * @param {RuleContext} context
   */
  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    const isTestFile = /\.(test|spec)\.(ts|tsx)$/.test(filename);
    
    // Only apply to TypeScript test files
    if (!isTestFile) {
      return {};
    }

    return {
      /**
       * @param {ESLintNode} node
       */
      TSAnyKeyword(node) {
        context.report({
          node,
          messageId: 'noAnyType',
        });
      },

      /**
       * @param {ESLintNode} node
       */
      TSTypeAssertion(node) {
        if (node.typeAnnotation && node.typeAnnotation.type === 'TSAnyKeyword') {
          context.report({
            node,
            messageId: 'noAsAny',
          });
        }
      },

      /**
       * @param {ESLintNode} node
       */
      TSAsExpression(node) {
        if (node.typeAnnotation && node.typeAnnotation.type === 'TSAnyKeyword') {
          context.report({
            node,
            messageId: 'noAsAny',
          });
        }
      },

      /**
       * @param {ESLintNode} node
       */
      VariableDeclarator(node) {
        // Check for variables without type annotations that might need them
        if (node.type === 'VariableDeclarator' && node.id && node.id.type === 'Identifier' && !node.id.typeAnnotation && node.init) {
          const variableName = node.id.name;
          
          // Flag test setup variables that should have explicit types
          const testSetupPatterns = [
            'mock', 'stub', 'fake', 'test', 'fixture', 'data', 'input', 'output', 'result'
          ];
          
          const needsType = testSetupPatterns.some(pattern => 
            variableName.toLowerCase().includes(pattern)
          );
          
          // Check if variable has implicit any through object assignment
          if (needsType && node.init && node.init.type === 'ObjectExpression' && node.id && node.id.type === 'Identifier' && !node.id.typeAnnotation) {
            context.report({
              node: node.id,
              messageId: 'noImplicitAny',
            });
          }
        }
      },

      /**
       * @param {ESLintNode} node
       */
      FunctionDeclaration(node) {
        // Check for functions without return type annotations
        if (node.type === 'FunctionDeclaration' && node.id && node.id.type === 'Identifier' && !node.returnType) {
          const functionName = node.id.name;
          
          // Flag test helper functions that should have explicit return types
          const testHelperPatterns = [
            'create', 'build', 'make', 'setup', 'teardown', 'helper', 'util'
          ];
          
          const isTestHelper = testHelperPatterns.some(pattern =>
            functionName.toLowerCase().includes(pattern)
          );
          
          if (isTestHelper) {
            context.report({
              node: node.id,
              messageId: 'noImplicitAny',
            });
          }
        }
      },

      /**
       * @param {ESLintNode} node  
       */
      ArrowFunctionExpression(node) {
        // Check for arrow functions in variable declarations without return types
        if (node.type === 'ArrowFunctionExpression' && node.parent && node.parent.type === 'VariableDeclarator' && 
            node.parent.id && node.parent.id.type === 'Identifier' && !node.returnType) {
          
          const variableName = node.parent.id.name;
          const testHelperPatterns = [
            'create', 'build', 'make', 'setup', 'teardown', 'helper', 'util'
          ];
          
          const isTestHelper = testHelperPatterns.some(pattern =>
            variableName.toLowerCase().includes(pattern)
          );
          
          if (isTestHelper) {
            context.report({
              node,
              messageId: 'noImplicitAny',
            });
          }
        }
      },
    };
  },
};