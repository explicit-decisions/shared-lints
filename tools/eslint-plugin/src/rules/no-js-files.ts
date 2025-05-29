/**
 * Rule: no-js-files
 * 
 * Prevents creation of .js files in TypeScript-first projects.
 * Encourages consistent use of TypeScript throughout the codebase.
 */

import type { Rule } from 'eslint';

export const noJsFiles: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow .js files in TypeScript-first projects',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Glob patterns for allowed .js files (e.g., config files)',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noJsFiles: 'JavaScript files not allowed in TypeScript-first project. Use .ts extension instead. If this is a config file that must be .js, add it to allowedPatterns in the ESLint rule configuration.',
    },
  },

  create(context: Rule.RuleContext) {
    const filename = context.getFilename();
    const options = context.options[0] || {};
    const allowedPatterns: string[] = options.allowedPatterns || [
      '**/eslint.config.js',
      '**/vitest.config.js', 
      '**/rollup.config.js',
      '**/vite.config.js'
    ];

    // Check if file is a .js file
    if (!filename.endsWith('.js')) {
      return {};
    }

    // Check if it matches allowed patterns using simple string matching
    const isAllowed = allowedPatterns.some(pattern => {
      // Simple pattern matching - convert glob pattern to regex
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
      const regex = new RegExp(regexPattern + '$');
      return regex.test(filename);
    });

    if (isAllowed) {
      return {};
    }

    return {
      Program(node) {
        context.report({
          node,
          messageId: 'noJsFiles',
          fix(_fixer) {
            // Don't auto-fix since this requires file system changes
            return null;
          },
        });
      },
    };
  },
};