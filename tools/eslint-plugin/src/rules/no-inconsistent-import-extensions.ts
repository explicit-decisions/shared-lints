/**
 * Rule: no-inconsistent-import-extensions
 * 
 * Detects when imports within a project inconsistently include or omit file extensions,
 * which suggests code copied from different sources without understanding the project's conventions.
 */

import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

type MessageIds = 'inconsistentImportExtensions';

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/shared-lints/shared-lints/blob/main/docs/RULES_REFERENCE.md#${name}`
);

export const noInconsistentImportExtensions = createRule<[], MessageIds>({
  name: 'no-inconsistent-import-extensions',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent use of file extensions in import statements',
    },
    schema: [],
    messages: {
      inconsistentImportExtensions: 'Inconsistent import extension usage. This file uses imports {{current}}, but other imports in the file use {{others}}. Be consistent throughout the file.',
    },
  },
  defaultOptions: [],

  create(context) {
    const importStyles = new Map<string, TSESTree.ImportDeclaration[]>();

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration): void {
        const source = node.source.value;
        
        // Only check relative imports
        if (typeof source === 'string' && source.startsWith('.')) {
          const hasExtension = /\.(js|ts|mjs|cjs|jsx|tsx)$/.test(source);
          const style = hasExtension ? 'with-extension' : 'without-extension';
          
          if (!importStyles.has(style)) {
            importStyles.set(style, []);
          }
          importStyles.get(style)?.push(node);
        }
      },

      'Program:exit'(): void {
        // Only report if there are inconsistent styles
        if (importStyles.size > 1) {
          const styles = Array.from(importStyles.keys());
          
          // Report on all imports that don't match the first style found
          const primaryStyle = styles[0];
          
          for (let i = 1; i < styles.length; i++) {
            const currentStyle = styles[i];
            if (!currentStyle) continue;
            
            const nodesWithStyle = importStyles.get(currentStyle) ?? [];
            for (const node of nodesWithStyle) {
              context.report({
                node,
                messageId: 'inconsistentImportExtensions',
                data: {
                  current: currentStyle.replace('-', ' '),
                  others: primaryStyle?.replace('-', ' ') ?? 'unknown',
                },
              });
            }
          }
        }
      }
    };
  },
});