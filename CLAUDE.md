# Claude Instructions

<!-- BEGIN: shared-lints/core-principles v1.0.0 -->
## Core Principle: Think Before Acting

**Before implementing any solution:**

1. Take a step back and think through the problem
2. Make sure you're actually focused on the right thing
3. If you're not sure, ASK - don't guess
4. If you're hitting a problem, get to the bottom of it rather than mashing on it until it works

This principle prevents "vibe coding" and ensures explicit, thoughtful decisions.
<!-- END: shared-lints/core-principles -->

<!-- BEGIN: shared-lints/project-patterns v1.0.0 -->
## Project Patterns

### Dependency Management

All dependencies must be tracked in decisions.toml with explicit decisions.

### Testing Philosophy

- No mocks or spies - use real implementations
- Factory functions for test data
- In-memory implementations for external services
<!-- END: shared-lints/project-patterns -->

## Project-Specific Instructions

This document provides specific instructions for AI assistants working with the shared-lints codebase.

### Project Metadata

All project metadata is centrally managed through `project-metadata.json`. When updating any package.json file:

1. **Check project-metadata.json first** - This is the source of truth for:
   - Organization name: `explicit-decisions`
   - Repository name: `shared-lints`
   - Package scope: `@explicit-decisions`
   - Repository URL: `https://github.com/explicit-decisions/shared-lints.git`

2. **Run validation** - After any package.json changes:

   ```bash
   pnpm lint:metadata
   ```

3. **Never guess URLs** - Always use the exact values from project-metadata.json

### Development Workflow

1. **ESLint Auto-fix** - Routinely run `eslint --fix` to eliminate problems as you create code:

   ```bash
   pnpm lint:fix
   ```

2. **Check everything** - Before considering work complete:

   ```bash
   pnpm lint        # Runs all checks including metadata
   pnpm build       # Ensures TypeScript compiles
   pnpm test        # Runs all tests
   ```

### Important Patterns

#### No Modern Node.js Import Workarounds

Modern Node.js supports ES modules natively. Avoid this outdated pattern:

```javascript
// ❌ Don't do this
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

// ✅ Do this instead
const packageJson = await import('../package.json', { with: { type: 'json' } });
```

#### Dependency Decisions

All dependencies must be tracked in `decisions.toml` with explicit decisions. When adding or updating dependencies:

1. Use the decisions CLI: `decisions deps add <package> --current <version> --decision <keep|update|deprecate> --reason "<why>"`
2. Include tier information for essential packages: `--tier essential --platform-alternative "<what was considered>"`
3. Review dates are automatically calculated based on tier (90 days for essential, 30 days for others)

### Common Tasks

#### Updating Documentation

When updating documentation, especially about explicit-decisions patterns:

1. Check if the pattern is already documented in `/docs/principles/`
2. Update the principles README.md if adding new principles
3. Ensure all cross-references are correct

#### Adding New ESLint Rules

1. Create the rule in `tools/eslint-plugin/src/rules/`
2. Add tests using real code examples
3. Update the rules reference in docs
4. Export from index.ts

#### Dependency Updates

Never update dependencies directly. Always:

1. Check current decisions: `decisions deps list --outdated`
2. Update with explicit decision: `decisions deps add <package> --decision update --reason "<why>"`
3. For CI checks: `pnpm lint:deps` (runs `decisions deps check`)

### Error Resolution

#### TypeScript Errors

- Focus on making types more specific, not using `any`
- Use factory functions to create properly typed test data

#### ESLint Errors

- Run `pnpm lint:fix` first
- For custom rules, check `/docs/guides/RULES_REFERENCE.md`

#### Build Errors

- Check that all imports use `.js` extensions (even for .ts files)
- Ensure TypeScript config uses `"rewriteRelativeImportExtensions": true`

### Key Principles

1. **Explicit over implicit** - Document all decisions
2. **Fail early** - Hard errors are better than warnings
3. **Encode in tools** - Don't rely on documentation alone
4. **Review regularly** - All decisions have expiry dates

### Helpful Context

- This is a monorepo using pnpm workspaces
- All packages use ESM (type: "module")
- TypeScript 5.7+ with native .ts import support
- ESLint 9+ with flat config
- No build step for pure JS packages

When in doubt, check existing patterns in the codebase rather than introducing new ones.

## Custom Patterns

<!-- Document patterns specific to your codebase -->