import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
const createRule = ESLintUtils.RuleCreator(name => `https://github.com/explicit-decisions/shared-lints/blob/main/docs/RULES_REFERENCE.md${name}`);
/**
 * ESLint rule to disallow npx/pnpx usage in favor of explicit pnpm exec
 * Enforces explicit package management and prevents arbitrary code execution
 */
export const noNpxUsage = createRule({
    name: 'no-npx-usage',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow the use of npx or pnpx commands',
        },
        fixable: 'code',
        schema: [],
        messages: {
            noNpx: "Use 'pnpm exec {{command}}' instead of 'npx {{command}}'",
            noPnpx: "Use 'pnpm exec {{command}}' instead of 'pnpx {{command}}'",
            noNpxInExecSync: "Use 'pnpm exec {{command}}' instead of 'npx {{command}}' in execSync calls",
            noPnpxInExecSync: "Use 'pnpm exec {{command}}' instead of 'pnpx {{command}}' in execSync calls",
        },
    },
    defaultOptions: [],
    create(context) {
        /**
         * Extract command name from npx/pnpx string
         */
        const extractCommand = (value, prefix) => {
            return value.substring(prefix.length).trim();
        };
        /**
         * Create auto-fix replacement
         */
        const createFix = (node, value, isNpx) => {
            const prefix = isNpx ? 'npx ' : 'pnpx ';
            const command = extractCommand(value, prefix);
            const replacement = `pnpm exec ${command}`;
            return (fixer) => {
                return fixer.replaceText(node, `"${replacement}"`);
            };
        };
        return {
            // Check string literals for npx/pnpx usage
            Literal(node) {
                if (typeof node.value === 'string') {
                    const value = node.value;
                    // Check for npx at start of string
                    if (value.startsWith('npx ')) {
                        const command = extractCommand(value, 'npx ');
                        context.report({
                            node,
                            messageId: 'noNpx',
                            data: { command },
                            fix: createFix(node, value, true),
                        });
                    }
                    // Check for pnpx at start of string
                    else if (value.startsWith('pnpx ')) {
                        const command = extractCommand(value, 'pnpx ');
                        context.report({
                            node,
                            messageId: 'noPnpx',
                            data: { command },
                            fix: createFix(node, value, false),
                        });
                    }
                }
            },
            // Check template literals for npx/pnpx usage
            TemplateLiteral(node) {
                if (node.quasis.length > 0) {
                    const firstQuasi = node.quasis[0];
                    if (firstQuasi?.value.raw.startsWith('npx ')) {
                        context.report({
                            node,
                            messageId: 'noNpx',
                            data: { command: 'command in template literal' },
                        });
                    }
                    else if (firstQuasi?.value.raw.startsWith('pnpx ')) {
                        context.report({
                            node,
                            messageId: 'noPnpx',
                            data: { command: 'command in template literal' },
                        });
                    }
                }
            },
            // Check for execSync calls with npx/pnpx
            CallExpression(node) {
                if (node.callee.type === AST_NODE_TYPES.Identifier &&
                    node.callee.name === 'execSync' &&
                    node.arguments.length > 0) {
                    const firstArg = node.arguments[0];
                    if (firstArg && firstArg.type === AST_NODE_TYPES.Literal && typeof firstArg.value === 'string') {
                        const value = firstArg.value;
                        if (value.startsWith('npx ')) {
                            const command = extractCommand(value, 'npx ');
                            context.report({
                                node: firstArg,
                                messageId: 'noNpxInExecSync',
                                data: { command },
                                fix: createFix(firstArg, value, true),
                            });
                        }
                        else if (value.startsWith('pnpx ')) {
                            const command = extractCommand(value, 'pnpx ');
                            context.report({
                                node: firstArg,
                                messageId: 'noPnpxInExecSync',
                                data: { command },
                                fix: createFix(firstArg, value, false),
                            });
                        }
                    }
                }
            },
        };
    },
});
//# sourceMappingURL=no-npx-usage.js.map