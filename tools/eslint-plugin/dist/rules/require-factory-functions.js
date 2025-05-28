import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
const createRule = ESLintUtils.RuleCreator(name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md${name}`);
/**
 * ESLint rule to encourage factory functions for test data creation
 * Promotes no-mocks testing philosophy with structured test data
 */
export const requireFactoryFunctions = createRule({
    name: 'require-factory-functions',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Encourage factory functions for test data instead of inline object literals',
        },
        // No fixable property - factory function extraction should be done manually
        schema: [],
        messages: {
            useFactory: 'Consider using a factory function for complex test data. Create a factory in test-utils/ for reusable test data creation.',
            extractFactory: 'Large object literal detected in test. Consider extracting to a factory function for better maintainability.',
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
         * Count properties in an object expression
         */
        const countObjectProperties = (node) => {
            return node.properties.length;
        };
        /**
         * Check if object has nested objects
         */
        const hasNestedObjects = (node) => {
            return node.properties.some(prop => prop.type === AST_NODE_TYPES.Property &&
                prop.value.type === AST_NODE_TYPES.ObjectExpression);
        };
        return {
            ObjectExpression(node) {
                const propertyCount = countObjectProperties(node);
                const hasNested = hasNestedObjects(node);
                // Flag objects with >5 properties or nested objects as candidates for factories
                if (propertyCount > 5 || hasNested) {
                    const isInVariableDeclarator = node.parent && node.parent.type === AST_NODE_TYPES.VariableDeclarator;
                    const isInCallExpression = node.parent && node.parent.type === AST_NODE_TYPES.CallExpression;
                    // Only suggest for test data, not for test configuration
                    if (isInVariableDeclarator || isInCallExpression) {
                        context.report({
                            node,
                            messageId: propertyCount > 8 ? 'extractFactory' : 'useFactory',
                        });
                    }
                }
            },
            ArrayExpression(node) {
                // Check for arrays of objects that could benefit from factories
                if (node.elements && node.elements.length > 3) {
                    const hasObjectElements = node.elements.some((el) => el !== null && el.type === AST_NODE_TYPES.ObjectExpression);
                    if (hasObjectElements) {
                        context.report({
                            node,
                            messageId: 'useFactory',
                        });
                    }
                }
            },
        };
    },
});
//# sourceMappingURL=require-factory-functions.js.map