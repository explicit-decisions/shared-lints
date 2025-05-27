import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
const createRule = ESLintUtils.RuleCreator(name => `https://github.com/explicit-decisions/shared-lints/blob/main/docs/RULES_REFERENCE.md#${name}`);
/**
 * ESLint rule to prevent using mocks and spies in tests
 * Promotes no-mocks testing philosophy with real implementations
 */
export const noMocksOrSpies = createRule({
    name: 'no-mocks-or-spies',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow the use of mocks and spies in tests',
        },
        fixable: 'code',
        schema: [],
        messages: {
            noMocks: 'Do not use mocks in tests. Use real implementations or dependency injection instead.',
            noSpies: 'Do not use spies in tests. Use real implementations or dependency injection instead.',
        },
    },
    defaultOptions: [],
    create(context) {
        const filename = context.filename || '';
        const isTestFile = /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filename);
        if (!isTestFile) {
            return {};
        }
        /**
         * Get the text content of a node safely
         */
        const getNodeText = (node) => {
            return context.sourceCode.getText(node);
        };
        /**
         * Find the statement node that contains the given node
         */
        const findStatement = (node) => {
            let current = node;
            while (current?.parent) {
                if (current.parent.type === AST_NODE_TYPES.ExpressionStatement ||
                    current.parent.type === AST_NODE_TYPES.VariableDeclaration) {
                    return current.parent;
                }
                current = current.parent;
            }
            return current || null;
        };
        return {
            CallExpression(node) {
                // Check for various mocking patterns
                const mockPatterns = [
                    'mock', 'jest.mock', 'vi.mock', 'sinon.mock',
                    'spy', 'jest.spy', 'vi.spy', 'sinon.spy',
                    'stub', 'jest.stub', 'vi.stub', 'sinon.stub',
                    'fake', 'jest.fake', 'vi.fake', 'sinon.fake',
                ];
                const calleeText = getNodeText(node.callee);
                for (const pattern of mockPatterns) {
                    if (calleeText.includes(pattern)) {
                        const messageId = pattern.includes('spy') ? 'noSpies' : 'noMocks';
                        context.report({
                            node,
                            messageId,
                            fix(fixer) {
                                // Auto-fix: Remove the entire statement
                                const statement = findStatement(node);
                                if (statement) {
                                    return fixer.remove(statement);
                                }
                                return null;
                            },
                        });
                        break;
                    }
                }
            },
            ImportDeclaration(node) {
                // Check for imports of mocking libraries
                const mockLibraries = [
                    'sinon', '@sinon/fake-timers', 'jest-mock', 'vitest/spy'
                ];
                if (node.source.type === AST_NODE_TYPES.Literal &&
                    typeof node.source.value === 'string' &&
                    mockLibraries.includes(node.source.value)) {
                    context.report({
                        node,
                        messageId: 'noMocks',
                        fix(fixer) {
                            return fixer.remove(node);
                        },
                    });
                }
            },
            VariableDeclarator(node) {
                // Check for mock assignments like: const mockFn = jest.fn()
                if (node.init && node.init.type === AST_NODE_TYPES.CallExpression) {
                    const calleeText = getNodeText(node.init.callee);
                    if (calleeText.includes('fn') || calleeText.includes('mock') || calleeText.includes('spy')) {
                        context.report({
                            node,
                            messageId: 'noMocks',
                            fix(fixer) {
                                // Remove the entire variable declaration statement
                                const statement = findStatement(node);
                                if (statement) {
                                    return fixer.remove(statement);
                                }
                                return null;
                            },
                        });
                    }
                }
            },
        };
    },
});
//# sourceMappingURL=no-mocks-or-spies.js.map