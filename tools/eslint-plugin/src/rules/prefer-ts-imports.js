import fs from "fs";
import path from "path";

/**
 * ESLint rule: prefer-ts-imports
 * 
 * Part of the "Enforced Explicit Decision" pattern for LLM-assisted development.
 * 
 * Enforces explicit decisions about file extensions by preferring .ts imports
 * when TypeScript files exist instead of .js imports. This prevents implicit
 * assumptions about file types and ensures clear intent.
 * 
 * Features:
 * - Auto-fixes .js imports to .ts when TypeScript files exist
 * - Handles ES6 imports, dynamic imports, require(), and export statements
 * - Supports relative path resolution
 * - Handles directory imports with index.ts files
 */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer importing from .ts files when they exist instead of .js",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      preferTsImport: "Import from {{tsPath}} instead of {{jsPath}}",
    },
  },

  create(context) {
    const filename = context.getFilename();
    const dirname = path.dirname(filename);

    function checkFileExists(filePath) {
      try {
        return fs.existsSync(filePath);
      } catch {
        return false;
      }
    }

    function resolveImportPath(importPath, fromDir) {
      // Handle relative imports
      if (importPath.startsWith(".")) {
        return path.resolve(fromDir, importPath);
      }

      // Handle node_modules or aliased imports
      // For now, we'll skip these as they require more complex resolution
      return null;
    }

    function checkAndReportImport(node, importPath, sourceNode) {
      // Skip if not a .js import
      if (!importPath.endsWith(".js")) {
        return;
      }

      const resolvedPath = resolveImportPath(importPath, dirname);
      if (!resolvedPath) {
        return;
      }

      // Check if corresponding .ts file exists
      const tsPath = resolvedPath.replace(/\.js$/, ".ts");

      // Also check for index.ts if importing a directory
      const indexTsPath = path.join(resolvedPath, "index.ts");

      let tsExists = false;

      if (checkFileExists(tsPath)) {
        tsExists = true;
      } else if (importPath.endsWith("/index.js")) {
        // Check if this is actually a directory import
        const dirPath = resolvedPath.replace(/\/index\.js$/, "");
        const dirIndexTs = path.join(dirPath, "index.ts");
        if (checkFileExists(dirIndexTs)) {
          tsExists = true;
        }
      } else {
        // Check if importing a directory that has index.ts
        if (checkFileExists(indexTsPath)) {
          tsExists = true;
        }
      }

      if (tsExists) {
        const jsImportPath = importPath;
        const tsImportPath = importPath.replace(/\.js$/, ".ts");

        context.report({
          node,
          messageId: "preferTsImport",
          data: {
            jsPath: jsImportPath,
            tsPath: tsImportPath,
          },
          fix(fixer) {
            // Calculate the correct range for the string literal
            const startOffset = sourceNode.range[0] + 1; // Skip opening quote
            const endOffset = sourceNode.range[1] - 1; // Skip closing quote

            const newImportPath = importPath.replace(/\.js$/, ".ts");

            return fixer.replaceTextRange(
              [startOffset, endOffset],
              newImportPath,
            );
          },
        });
      }
    }

    return {
      // Handle ES6 imports
      ImportDeclaration(node) {
        if (node.source && node.source.type === "Literal") {
          checkAndReportImport(node, node.source.value, node.source);
        }
      },

      // Handle dynamic imports
      ImportExpression(node) {
        if (node.source && node.source.type === "Literal") {
          checkAndReportImport(node, node.source.value, node.source);
        }
      },

      // Handle require() calls
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments.length > 0 &&
          node.arguments[0].type === "Literal"
        ) {
          const importPath = node.arguments[0].value;
          checkAndReportImport(node, importPath, node.arguments[0]);
        }
      },

      // Handle export ... from statements
      ExportNamedDeclaration(node) {
        if (node.source && node.source.type === "Literal") {
          checkAndReportImport(node, node.source.value, node.source);
        }
      },

      ExportAllDeclaration(node) {
        if (node.source && node.source.type === "Literal") {
          checkAndReportImport(node, node.source.value, node.source);
        }
      },
    };
  },
};