import fs from 'fs';
import path from 'path';
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
const createRule = ESLintUtils.RuleCreator(name => `https://github.com/explicit-decisions/shared-lints/blob/main/docs/RULES_REFERENCE.md${name}`);
/**
 * ESLint rule to require .ts extensions when importing .ts files that exist on disk
 */
export const requireTsExtensions = createRule({
    name: 'require-ts-extensions',
    meta: {
        type: 'problem',
        docs: {
            description: 'Require .ts extensions when importing .ts files that exist on disk',
        },
        fixable: 'code',
        schema: [],
        messages: {
            missingTsExtension: 'Missing .ts extension for import "{{importPath}}". Add .ts extension.',
        },
    },
    defaultOptions: [],
    create(context) {
        const filename = context.filename || '';
        /**
         * Resolve relative import path to absolute path
         */
        const resolveImportPath = (importPath, fromDir) => {
            if (importPath.startsWith('.')) {
                return path.resolve(fromDir, importPath);
            }
            return importPath;
        };
        /**
         * Check if a TypeScript file exists at the given path
         */
        const tsFileExists = (basePath) => {
            const tsPath = `${basePath}.ts`;
            try {
                return fs.existsSync(tsPath) && fs.statSync(tsPath).isFile();
            }
            catch {
                return false;
            }
        };
        /**
         * Create auto-fix for adding .ts extension
         */
        const createFix = (node, importPath) => {
            return (fixer) => {
                const newImportPath = `${importPath}.ts`;
                return fixer.replaceText(node, `"${newImportPath}"`);
            };
        };
        return {
            ImportDeclaration(node) {
                if (node.source.type === AST_NODE_TYPES.Literal &&
                    typeof node.source.value === 'string') {
                    const importPath = node.source.value;
                    // Only check relative imports
                    if (importPath.startsWith('.')) {
                        // Skip if already has .ts extension
                        if (importPath.endsWith('.ts')) {
                            return;
                        }
                        const currentDir = path.dirname(filename);
                        const resolvedPath = resolveImportPath(importPath, currentDir);
                        if (tsFileExists(resolvedPath)) {
                            context.report({
                                node: node.source,
                                messageId: 'missingTsExtension',
                                data: { importPath },
                                fix: createFix(node.source, importPath),
                            });
                        }
                    }
                }
            },
            // Also check dynamic imports
            CallExpression(node) {
                const calleeText = context.sourceCode.getText(node.callee);
                if (calleeText === 'import' && node.arguments.length > 0) {
                    const firstArg = node.arguments[0];
                    if (firstArg && firstArg.type === AST_NODE_TYPES.Literal &&
                        typeof firstArg.value === 'string') {
                        const importPath = firstArg.value;
                        // Only check relative imports
                        if (importPath.startsWith('.')) {
                            // Skip if already has .ts extension
                            if (importPath.endsWith('.ts')) {
                                return;
                            }
                            const currentDir = path.dirname(filename);
                            const resolvedPath = resolveImportPath(importPath, currentDir);
                            if (tsFileExists(resolvedPath)) {
                                context.report({
                                    node: firstArg,
                                    messageId: 'missingTsExtension',
                                    data: { importPath },
                                    fix: createFix(firstArg, importPath),
                                });
                            }
                        }
                    }
                }
            },
        };
    },
});
//# sourceMappingURL=require-ts-extensions.js.map