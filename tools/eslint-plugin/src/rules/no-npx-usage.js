// @ts-check

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('eslint').Rule.RuleFixer} RuleFixer
 * @typedef {import('eslint').Rule.Node} ESLintNode
 */

/**
 * ESLint rule to disallow npx/pnpx usage in favor of explicit pnpm exec
 * Enforces explicit package management and prevents arbitrary code execution
 * @type {RuleModule}
 */
export const noNpxUsage = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow the use of npx or pnpx commands",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      noNpx: "Use 'pnpm exec {{command}}' instead of 'npx {{command}}'",
      noPnpx: "Use 'pnpm exec {{command}}' instead of 'pnpx {{command}}'",
      noNpxInExecSync: "Use 'pnpm exec {{command}}' instead of 'npx {{command}}' in execSync calls",
      noPnpxInExecSync: "Use 'pnpm exec {{command}}' instead of 'pnpx {{command}}' in execSync calls",
    },
  },

  /**
   * @param {RuleContext} context
   */
  create(context) {
    return {
      // Check string literals for npx/pnpx usage
      /**
       * @param {ESLintNode} node
       */
      Literal(node) {
        if (typeof node.value === 'string') {
          const value = node.value;
          
          // Check for npx at start of string
          if (value.startsWith('pnpm exec ')) {
            const command = value.substring(4);
            context.report({
              node,
              messageId: "noNpx",
              data: { command },
              /**
               * @param {RuleFixer} fixer
               */
              fix(fixer) {
                return fixer.replaceText(node, `'pnpm exec ${command}'`);
              }
            });
          }
          
          // Check for pnpx at start of string  
          if (value.startsWith('pnpm exec ')) {
            const command = value.substring(5);
            context.report({
              node,
              messageId: "noPnpx", 
              data: { command },
              /**
               * @param {RuleFixer} fixer
               */
              fix(fixer) {
                return fixer.replaceText(node, `'pnpm exec ${command}'`);
              }
            });
          }
        }
      },

      // Check template literals for npx/pnpx usage
      /**
       * @param {ESLintNode} node
       */
      TemplateLiteral(node) {
        if (node.quasis.length === 1) {
          const value = node.quasis[0].value.cooked;
          if (value && (value.startsWith('pnpm exec ') || value.startsWith('pnpm exec '))) {
            const isNpx = value.startsWith('pnpm exec ');
            const command = value.substring(isNpx ? 4 : 5);
            context.report({
              node,
              messageId: isNpx ? "noNpx" : "noPnpx",
              data: { command },
              /**
               * @param {RuleFixer} fixer
               */
              fix(fixer) {
                return fixer.replaceText(node, `\`pnpm exec ${command}\``);
              }
            });
          }
        }
      },

      // Check execSync calls specifically
      /**
       * @param {ESLintNode} node
       */
      CallExpression(node) {
        if (node.callee.name === 'execSync' || 
            (node.callee.type === 'MemberExpression' && 
             node.callee.property.name === 'execSync')) {
          
          const firstArg = node.arguments[0];
          if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            const command = firstArg.value;
            
            if (command.startsWith('pnpm exec ')) {
              const actualCommand = command.substring(4);
              context.report({
                node: firstArg,
                messageId: "noNpxInExecSync",
                data: { command: actualCommand },
                /**
                 * @param {RuleFixer} fixer
                 */
                fix(fixer) {
                  return fixer.replaceText(firstArg, `'pnpm exec ${actualCommand}'`);
                }
              });
            }
            
            if (command.startsWith('pnpm exec ')) {
              const actualCommand = command.substring(5);
              context.report({
                node: firstArg,
                messageId: "noPnpxInExecSync", 
                data: { command: actualCommand },
                /**
                 * @param {RuleFixer} fixer
                 */
                fix(fixer) {
                  return fixer.replaceText(firstArg, `'pnpm exec ${actualCommand}'`);
                }
              });
            }
          }
        }
      }
    };
  },
};