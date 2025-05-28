import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 'injectDependency' | 'useRealImplementation' | 'extractInterface';

export interface Options {
  allowedGlobals?: string[];
}

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md${name}`
);

/**
 * ESLint rule to encourage dependency injection and real implementations
 * Promotes testable architectures over hard-coded dependencies
 */
export const preferRealImplementations = createRule<[Options], MessageIds>({
  name: 'prefer-real-implementations',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage dependency injection and real implementations over hard-coded dependencies',
    },
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
  defaultOptions: [{}],
  create(context) {
    const filename = context.filename || '';
    const isTestFile = /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filename);
    const options = context.options[0] ?? {};
    const allowedGlobals = new Set(options.allowedGlobals ?? ['console', 'process', 'global', 'window']);
    
    // Dependencies that could be injected for better testability
    const injectableDependencies = new Set([
      'fs', 'path', 'crypto', 'os', 'util', 'events', 'stream',
      'child_process', 'readline', 'zlib', 'http', 'https', 'url',
      'querystring', 'dns', 'net', 'tls', 'cluster', 'worker_threads',
      'Math.random', 'Date.now', 'performance.now'
    ]);

    return {
      // Check for import statements that could use dependency injection
      ImportDeclaration(node: TSESTree.ImportDeclaration): void {
        if (node.source.type === AST_NODE_TYPES.Literal && typeof node.source.value === 'string') {
          const importSource = node.source.value;
          
          // Check for Node.js built-in modules that could be injected
          if (injectableDependencies.has(importSource) || importSource.startsWith('node:')) {
            const hasDefaultImport = node.specifiers.some(spec => spec.type === AST_NODE_TYPES.ImportDefaultSpecifier);
            const hasNamespaceImport = node.specifiers.some(spec => spec.type === AST_NODE_TYPES.ImportNamespaceSpecifier);
            
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

      // Check for direct access to global objects
      MemberExpression(node: TSESTree.MemberExpression): void {
        if (node.object.type === AST_NODE_TYPES.Identifier) {
          const objectName = node.object.name;
          
          // Skip allowed globals
          if (allowedGlobals.has(objectName)) {
            return;
          }
          
          // Check for global objects that could be injected
          const problematicGlobals = ['Math', 'Date', 'performance'];
          if (problematicGlobals.includes(objectName)) {
            context.report({
              node,
              messageId: 'injectDependency',
              data: { dependency: objectName },
            });
          }
        }
      },

      // Check for function calls to global APIs
      CallExpression(node: TSESTree.CallExpression): void {
        if (node.callee.type === AST_NODE_TYPES.MemberExpression &&
            node.callee.object.type === AST_NODE_TYPES.Identifier) {
          
          const objectName = node.callee.object.name;
          
          // Skip allowed globals
          if (allowedGlobals.has(objectName)) {
            return;
          }
          
          // Check for calls to APIs that could be injected
          const injectableAPIs = ['fetch', 'setTimeout', 'setInterval', 'requestAnimationFrame'];
          if (injectableAPIs.includes(objectName)) {
            context.report({
              node,
              messageId: 'injectDependency', 
              data: { dependency: objectName },
            });
          }
        }
      },

      // Check for test functions that could benefit from real implementations
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
        if (isTestFile && node.id && node.id.type === AST_NODE_TYPES.Identifier) {
          const functionName = node.id.name;
          
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
});