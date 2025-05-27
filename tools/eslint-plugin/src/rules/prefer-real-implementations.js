// @ts-check

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('eslint').Rule.RuleFixer} RuleFixer
 * @typedef {import('eslint').Rule.Node} ESLintNode
 */

/**
 * ESLint rule to encourage dependency injection and real implementations
 * Promotes testable architectures over hard-coded dependencies
 * @type {RuleModule}
 */
export const preferRealImplementations = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage dependency injection and real implementations over hard-coded dependencies',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: undefined, // Dependency injection patterns can't be auto-fixed
    schema: [
      {
        type: 'object',
        properties: {
          allowedGlobals: {
            type: 'array',
            items: { type: 'string' },
            description: 'Global dependencies that are allowed (e.g., console, process)'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      injectDependency: 'Consider injecting "{{dependency}}" as a parameter instead of accessing it directly. This makes the code more testable.',
      useRealImplementation: 'Instead of mocking "{{dependency}}", consider creating a real implementation or using dependency injection.',
      extractInterface: 'Consider extracting an interface for "{{dependency}}" to enable dependency injection and testing with real implementations.',
    },
  },
  /**
   * @param {RuleContext} context
   */
  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    const isTestFile = /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filename);
    const options = context.options[0] || {};
    const allowedGlobals = new Set(options.allowedGlobals || ['console', 'process', 'Buffer', 'global', 'window', 'document']);

    // Common dependencies that should be injected
    const injectableDependencies = new Set([
      'fs', 'path', 'http', 'https', 'crypto', 'os', 'util', 'events',
      'fetch', 'XMLHttpRequest', 'localStorage', 'sessionStorage',
      'Date', 'Math.random', 'setTimeout', 'setInterval'
    ]);

    return {
      /**
       * @param {ESLintNode} node
       */
      ImportDeclaration(node) {
        if (!isTestFile && node.type === 'ImportDeclaration' && node.source && typeof node.source.value === 'string') {
          const importSource = node.source.value;
          
          // Check for Node.js built-in modules that could be injected
          if (injectableDependencies.has(importSource) || importSource.startsWith('node:')) {
            const hasDefaultImport = node.specifiers.some(spec => spec.type === 'ImportDefaultSpecifier');
            const hasNamespaceImport = node.specifiers.some(spec => spec.type === 'ImportNamespaceSpecifier');
            
            if (hasDefaultImport || hasNamespaceImport) {
              context.report({
                node,
                messageId: 'injectDependency',
                data: { dependency: importSource },
              });
            }
          }
        }
      },

      /**
       * @param {ESLintNode} node
       */
      CallExpression(node) {
        if (!isTestFile && node.type === 'CallExpression') {
          // Check for direct calls to injectable dependencies
          if (node.callee.type === 'Identifier') {
            const callName = node.callee.name;
            if (injectableDependencies.has(callName) && !allowedGlobals.has(callName)) {
              context.report({
                node,
                messageId: 'injectDependency',
                data: { dependency: callName },
              });
            }
          } else if (node.callee.type === 'MemberExpression' && 
                     node.callee.object.type === 'Identifier') {
            const objectName = node.callee.object.name;
            if (injectableDependencies.has(objectName) && !allowedGlobals.has(objectName)) {
              context.report({
                node,
                messageId: 'injectDependency', 
                data: { dependency: objectName },
              });
            }
          }
        }
      },

      /**
       * @param {ESLintNode} node
       */
      NewExpression(node) {
        if (!isTestFile && node.type === 'NewExpression' && node.callee.type === 'Identifier') {
          const className = node.callee.name;
          
          // Flag constructors that often need injection
          const injectableClasses = ['Date', 'XMLHttpRequest', 'WebSocket', 'Worker'];
          
          if (injectableClasses.includes(className)) {
            context.report({
              node,
              messageId: 'injectDependency',
              data: { dependency: className },
            });
          }
        }
      },

      /**
       * @param {ESLintNode} node
       */
      FunctionDeclaration(node) {
        if (isTestFile && node.type === 'FunctionDeclaration' && node.id) {
          const functionName = node.id.name;
          
          // Look for test functions that might benefit from real implementations
          if (functionName.startsWith('test') || functionName.startsWith('it') || 
              functionName.includes('Mock') || functionName.includes('Stub')) {
            
            // Check if function contains test expectations (suggests it's doing actual testing)
            const bodyText = context.sourceCode.getText(node.body);
            const hasTestExpectations = bodyText.includes('expect(') || 
                                      bodyText.includes('assert') ||
                                      bodyText.includes('should');
            
            if (hasTestExpectations) {
              context.report({
                node: node.id,
                messageId: 'useRealImplementation',
                data: { dependency: 'complex test logic' },
              });
            }
          }
        }
      },
    };
  },
};