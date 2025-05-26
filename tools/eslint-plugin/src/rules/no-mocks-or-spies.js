// @ts-check

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('eslint').Rule.RuleFixer} RuleFixer
 * @typedef {import('eslint').Rule.Node} ESLintNode
 */

/**
 * ESLint rule to prevent using mocks and spies in tests
 * Promotes no-mocks testing philosophy with real implementations
 * @type {RuleModule}
 */
export const noMocksOrSpies = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of mocks and spies in tests',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noMocks: 'Do not use mocks in tests. Use real implementations or dependency injection instead.',
      noSpies: 'Do not use spies in tests. Use real implementations or dependency injection instead.',
    },
  },
  /**
   * @param {RuleContext} context
   */
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const isTestFile = /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filename);
    
    if (!isTestFile) {
      return {};
    }

    return {
      /**
       * @param {ESLintNode} node
       */
      CallExpression(node) {
        // Check for various mocking patterns
        const mockPatterns = [
          'mock', 'jest.mock', 'vi.mock', 'sinon.mock',
          'spy', 'jest.spy', 'vi.spy', 'sinon.spy',
          'stub', 'jest.stub', 'vi.stub', 'sinon.stub',
          'fake', 'jest.fake', 'vi.fake', 'sinon.fake',
        ];

        if (node.type !== 'CallExpression') return;
        const calleeText = context.sourceCode.getText(node.callee);
        
        for (const pattern of mockPatterns) {
          if (calleeText.includes(pattern)) {
            const messageId = pattern.includes('spy') ? 'noSpies' : 'noMocks';
            context.report({
              node,
              messageId,
              /**
               * @param {RuleFixer} fixer
               */
              fix(fixer) {
                // Auto-fix: Remove the entire statement
                const statement = node.parent?.type === 'ExpressionStatement' ? node.parent : node;
                return fixer.remove(statement);
              },
            });
            break;
          }
        }
      },
      
      /**
       * @param {ESLintNode} node
       */
      ImportDeclaration(node) {
        // Check for imports of mocking libraries
        const mockLibraries = [
          'sinon', '@sinon/fake-timers', 'jest-mock', 'vitest/spy'
        ];
        
        if (node.type !== 'ImportDeclaration' || !node.source || typeof node.source.value !== 'string') return;
        if (mockLibraries.includes(node.source.value)) {
          context.report({
            node,
            messageId: 'noMocks',
            /**
             * @param {RuleFixer} fixer
             */
            fix(fixer) {
              return fixer.remove(node);
            },
          });
        }
      },

      /**
       * @param {ESLintNode} node
       */
      VariableDeclarator(node) {
        // Check for mock assignments like: const mockFn = jest.fn()
        if (node.type !== 'VariableDeclarator' || !node.init || node.init.type !== 'CallExpression') return;
        const calleeText = context.sourceCode.getText(node.init.callee);
        if (calleeText.includes('fn') || calleeText.includes('mock') || calleeText.includes('spy')) {
          context.report({
            node,
            messageId: 'noMocks',
            /**
             * @param {RuleFixer} fixer
             */
            fix(fixer) {
              // Remove the entire variable declaration statement
              let statement = node.parent;
              while (statement && statement.type !== 'VariableDeclaration') {
                statement = statement.parent;
              }
              if (statement) {
                return fixer.remove(statement);
              }
              return null;
            },
          });
        }
      },
    };
  },
};