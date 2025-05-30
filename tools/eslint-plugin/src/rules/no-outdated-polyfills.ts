/**
 * Rule: no-outdated-polyfills
 * 
 * Detects usage of polyfills or workarounds for features that are now natively supported,
 * suggesting code copied from older sources without understanding modern alternatives.
 */

import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 'outdatedPolyfill';

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md#${name}`
);

export const noOutdatedPolyfills = createRule<[], MessageIds>({
  name: 'no-outdated-polyfills',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Detect usage of polyfills for features that are now natively supported',
    },
    schema: [],
    messages: {
      outdatedPolyfill: 'Using {{pattern}} when {{modern}} is available. This suggests copy-paste from old code.',
    },
  },
  defaultOptions: [],

  create(context) {
    function isFileURLToPath(node: TSESTree.CallExpression): boolean {
      return node.callee.type === AST_NODE_TYPES.Identifier && 
             node.callee.name === 'fileURLToPath';
    }

    function isDirname(node: TSESTree.CallExpression): boolean {
      return node.callee.type === AST_NODE_TYPES.MemberExpression &&
             node.callee.object.type === AST_NODE_TYPES.Identifier &&
             node.callee.object.name === 'path' &&
             node.callee.property.type === AST_NODE_TYPES.Identifier &&
             node.callee.property.name === 'dirname';
    }

    return {
      // Detect __dirname = dirname(fileURLToPath(import.meta.url))
      VariableDeclarator(node: TSESTree.VariableDeclarator): void {
        if (node.id.type === AST_NODE_TYPES.Identifier && 
            node.id.name === '__dirname' &&
            node.init?.type === AST_NODE_TYPES.CallExpression) {
          
          // Check for dirname(fileURLToPath(...)) pattern
          if (isDirname(node.init) && 
              node.init.arguments[0]?.type === AST_NODE_TYPES.CallExpression &&
              isFileURLToPath(node.init.arguments[0])) {
            context.report({
              node,
              messageId: 'outdatedPolyfill',
              data: {
                pattern: '__dirname = dirname(fileURLToPath(import.meta.url))',
                modern: 'import.meta.dirname',
              },
            });
          }
        }
      },

      // Detect JSON import workarounds
      ImportDeclaration(node: TSESTree.ImportDeclaration): void {
        // Check for fs imports that might be used for JSON reading
        if (node.source.value === 'fs' || node.source.value === 'node:fs') {
          // Mark this import for checking in combination with readFileSync
          const parent = node.parent;
          if (parent && parent.type === AST_NODE_TYPES.Program) {
            // We'll check for JSON.parse(readFileSync(...)) patterns in CallExpression
          }
        }
      },

      // Detect various polyfill patterns in calls
      CallExpression(node: TSESTree.CallExpression): void {
        // Detect Promise.resolve().then() pattern
        if (node.callee.type === AST_NODE_TYPES.MemberExpression &&
            node.callee.property.type === AST_NODE_TYPES.Identifier &&
            node.callee.property.name === 'then') {
          
          const obj = node.callee.object;
          if (obj.type === AST_NODE_TYPES.CallExpression &&
              obj.callee.type === AST_NODE_TYPES.MemberExpression &&
              obj.callee.object.type === AST_NODE_TYPES.Identifier &&
              obj.callee.object.name === 'Promise' &&
              obj.callee.property.type === AST_NODE_TYPES.Identifier &&
              obj.callee.property.name === 'resolve') {
            context.report({
              node,
              messageId: 'outdatedPolyfill',
              data: {
                pattern: 'Promise.resolve().then()',
                modern: 'async/await',
              },
            });
          }
        }

        // Detect JSON.parse(readFileSync(...)) for .json files
        if (node.callee.type === AST_NODE_TYPES.MemberExpression &&
            node.callee.object.type === AST_NODE_TYPES.Identifier &&
            node.callee.object.name === 'JSON' &&
            node.callee.property.type === AST_NODE_TYPES.Identifier &&
            node.callee.property.name === 'parse' &&
            node.arguments[0]?.type === AST_NODE_TYPES.CallExpression) {
          
          const readCall = node.arguments[0];
          if (readCall.callee.type === AST_NODE_TYPES.Identifier &&
              readCall.callee.name === 'readFileSync' &&
              readCall.arguments[0]) {
            
            // Check if it's reading a .json file
            const fileArg = readCall.arguments[0];
            if (fileArg.type === AST_NODE_TYPES.Literal &&
                typeof fileArg.value === 'string' &&
                fileArg.value.endsWith('.json')) {
              context.report({
                node,
                messageId: 'outdatedPolyfill',
                data: {
                  pattern: 'JSON.parse(readFileSync(...json))',
                  modern: 'import data from "./file.json" with { type: "json" }',
                },
              });
            }
          }
        }

        // Detect Array.prototype.slice.call() pattern
        if (node.callee.type === AST_NODE_TYPES.MemberExpression &&
            node.callee.property.type === AST_NODE_TYPES.Identifier &&
            node.callee.property.name === 'call' &&
            node.callee.object.type === AST_NODE_TYPES.MemberExpression) {
          
          const arrayMethod = node.callee.object;
          if (arrayMethod.object.type === AST_NODE_TYPES.MemberExpression &&
              arrayMethod.object.object.type === AST_NODE_TYPES.Identifier &&
              arrayMethod.object.object.name === 'Array' &&
              arrayMethod.object.property.type === AST_NODE_TYPES.Identifier &&
              arrayMethod.object.property.name === 'prototype' &&
              arrayMethod.property.type === AST_NODE_TYPES.Identifier &&
              arrayMethod.property.name === 'slice') {
            context.report({
              node,
              messageId: 'outdatedPolyfill',
              data: {
                pattern: 'Array.prototype.slice.call()',
                modern: 'Array.from() or spread syntax [...args]',
              },
            });
          }
        }
      },
    };
  },
});