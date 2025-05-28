import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
const createRule = ESLintUtils.RuleCreator(name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md${name}`);
/**
 * ESLint rule to prevent 'any' types in test files
 * Ensures tests follow same TypeScript strictness as production code
 */
export const noAnyInTests = createRule({
    name: 'no-any-in-tests',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow any types in test files to maintain type safety',
        },
        schema: [],
        messages: {
            noAnyType: 'Avoid using "any" type in tests. Use proper typing or create specific interfaces for test data.',
            noAsAny: 'Avoid using "as any" type assertions in tests. Use proper type guards or specific interfaces.',
            noImplicitAny: 'Add explicit type annotation. Tests should follow the same TypeScript strictness as production code.',
        },
    },
    defaultOptions: [],
    create(context) {
        const filename = context.filename || '';
        const isTestFile = /\.(test|spec)\.(ts|tsx)$/.test(filename);
        if (!isTestFile) {
            return {};
        }
        /**
         * Check if a node represents an 'any' type
         */
        const isAnyType = (node) => {
            return node.type === AST_NODE_TYPES.TSAnyKeyword;
        };
        /**
         * Check if a type assertion uses 'any'
         */
        const isAsAnyAssertion = (node) => {
            return isAnyType(node.typeAnnotation);
        };
        /**
         * Type guard for TSTypeAnnotation
         */
        const hasTSTypeAnnotation = (node) => {
            return 'typeAnnotation' in node && node.typeAnnotation !== null;
        };
        return {
            // Check for explicit 'any' type usage
            TSAnyKeyword(node) {
                context.report({
                    node,
                    messageId: 'noAnyType',
                });
            },
            // Check for 'as any' type assertions  
            TSTypeAssertion(node) {
                if (isAsAnyAssertion(node)) {
                    context.report({
                        node,
                        messageId: 'noAsAny',
                    });
                }
            },
            // Check for 'as any' in TSAsExpression (newer syntax)
            TSAsExpression(node) {
                if (isAsAnyAssertion(node)) {
                    context.report({
                        node,
                        messageId: 'noAsAny',
                    });
                }
            },
            // Check for variables that might need explicit type annotations
            VariableDeclarator(node) {
                if (node.id.type === AST_NODE_TYPES.Identifier &&
                    !hasTSTypeAnnotation(node.id) &&
                    node.init) {
                    const variableName = node.id.name;
                    // Flag test setup variables that should have explicit types
                    const testSetupPatterns = [
                        'mock', 'stub', 'fake', 'test', 'fixture', 'data', 'input', 'output', 'result'
                    ];
                    const needsType = testSetupPatterns.some(pattern => variableName.toLowerCase().includes(pattern));
                    // Check if variable has implicit any through object assignment
                    if (needsType &&
                        node.init.type === AST_NODE_TYPES.ObjectExpression &&
                        !hasTSTypeAnnotation(node.id)) {
                        context.report({
                            node: node.id,
                            messageId: 'noImplicitAny',
                        });
                    }
                }
            },
            // Check for functions without return type annotations
            FunctionDeclaration(node) {
                if (node.id &&
                    node.id.type === AST_NODE_TYPES.Identifier &&
                    !('returnType' in node && node.returnType)) {
                    const functionName = node.id.name;
                    // Flag test helper functions that should have explicit return types
                    const testHelperPatterns = [
                        'create', 'build', 'make', 'setup', 'teardown', 'helper', 'util'
                    ];
                    const isTestHelper = testHelperPatterns.some(pattern => functionName.toLowerCase().includes(pattern));
                    if (isTestHelper) {
                        context.report({
                            node: node.id,
                            messageId: 'noImplicitAny',
                        });
                    }
                }
            },
            // Check for arrow functions in variable declarations without return types
            ArrowFunctionExpression(node) {
                if (Boolean(node.parent) &&
                    node.parent.type === AST_NODE_TYPES.VariableDeclarator &&
                    Boolean(node.parent.id) &&
                    node.parent.id.type === AST_NODE_TYPES.Identifier &&
                    !('returnType' in node && node.returnType)) {
                    const variableName = node.parent.id.name;
                    const testHelperPatterns = [
                        'create', 'build', 'make', 'setup', 'teardown', 'helper', 'util'
                    ];
                    const isTestHelper = testHelperPatterns.some(pattern => variableName.toLowerCase().includes(pattern));
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
});
//# sourceMappingURL=no-any-in-tests.js.map