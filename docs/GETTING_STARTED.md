# Getting Started with the Enforced Explicit Decisions Framework

This guide will help you integrate the Enforced Explicit Decisions framework into your TypeScript/JavaScript project in under 10 minutes.

## What is the Enforced Explicit Decisions Framework?

The **Enforced Explicit Decisions framework** helps developers work more effectively with AI assistants by making technical decisions explicit and enforceable. It implements the "Enforced Explicit Decisions" pattern to prevent AI from making incorrect assumptions about your codebase by enforcing documentation of non-standard patterns.

## Prerequisites

- Node.js 18+ and pnpm (recommended) or npm/yarn
- A TypeScript or JavaScript project
- ESLint 9.0+ (or willingness to upgrade)

## Quick Start

### 1. Install the Framework

```bash
# Using pnpm (recommended)
pnpm add -D @explicit-decisions/eslint-config @explicit-decisions/eslint-plugin

# Using npm
npm install --save-dev @explicit-decisions/eslint-config @explicit-decisions/eslint-plugin

# Using yarn
yarn add -D @explicit-decisions/eslint-config @explicit-decisions/eslint-plugin
```

### 2. Configure ESLint

Create or update your `eslint.config.js`:

```javascript
import explicitConfig from '@explicit-decisions/eslint-config';
import explicitPlugin from '@explicit-decisions/eslint-plugin';

export default [
  ...explicitConfig.base,
  {
    plugins: {
      '@explicit-decisions': explicitPlugin
    },
    rules: {
      // Start with warnings to see impact
      '@explicit-decisions/no-mocks-or-spies': 'warn',
      '@explicit-decisions/require-ts-extensions': 'warn',
      '@explicit-decisions/no-npx-usage': 'warn'
    }
  }
];
```

### 3. Run Your First Lint

```bash
# See what the rules catch
pnpm lint

# Auto-fix what can be fixed
pnpm lint:fix
```

## Understanding the Core Rules

### 1. No Mocks or Spies

This rule prevents use of mocking libraries, encouraging real implementations:

```typescript
// ❌ This will be flagged
import { jest } from '@jest/globals';
const mockUser = jest.fn();

// ✅ This is encouraged
import { createTestUser } from './test-factories';
const user = createTestUser({ name: 'Test' });
```

**Why?** Mocks couple tests to implementation details. Real implementations make tests more reliable.

### 2. Require TypeScript Extensions

This rule requires explicit `.ts` extensions for local imports:

```typescript
// ❌ This will be flagged
import { utils } from './utils';

// ✅ This is required
import { utils } from './utils.ts';
```

**Why?** Explicit extensions eliminate ambiguity and help AI understand your module structure.

### 3. No NPX Usage

This rule prevents arbitrary package execution:

```bash
# ❌ This will be flagged
npx prettier --write .

# ✅ This is required
pnpm exec prettier --write .
# or add to package.json and use
pnpm run format
```

**Why?** NPX can execute arbitrary code. Explicit dependencies are safer and more predictable.

## Setting Up AI Collaboration

### 1. Create an AI Context File

Create `CLAUDE.md` (or `AI_CONTEXT.md`) in your project root:

```markdown
# AI Context for [Your Project]

## Project Overview
[Brief description of your project]

## Key Technical Decisions
- We use React 16 because [reason]
- We prefer factories over mocks because [reason]
- We use pnpm for package management

## Development Workflow
- Run `pnpm lint` before committing
- Use `pnpm deps:interactive` for dependency updates
- Follow two-phase development: exploration then consolidation

## Commands
- `pnpm dev` - Start development
- `pnpm test` - Run tests
- `pnpm lint` - Check code quality
```

### 2. Configure Your AI Assistant

When working with AI, start conversations with:

```
This project uses the shared-lints framework.
See CLAUDE.md for context and conventions.
We enforce no mocks, explicit imports, and no npx.
```

## Progressive Adoption

### Phase 1: Start with Warnings (Week 1)

```javascript
rules: {
  'shared-lints/no-mocks-or-spies': 'warn',
  'shared-lints/require-ts-extensions': 'warn',
  'shared-lints/no-npx-usage': 'warn'
}
```

- See what patterns exist in your codebase
- Discuss with team which rules to enforce
- Fix issues gradually

### Phase 2: Enforce Critical Rules (Week 2-3)

```javascript
rules: {
  'shared-lints/no-npx-usage': 'error', // Security-critical
  'shared-lints/require-ts-extensions': 'warn',
  'shared-lints/no-mocks-or-spies': 'warn'
}
```

- Enforce security-critical rules first
- Continue fixing warnings
- Document decisions as you go

### Phase 3: Full Adoption (Week 4+)

```javascript
rules: {
  'shared-lints/no-npx-usage': 'error',
  'shared-lints/require-ts-extensions': 'error',
  'shared-lints/no-mocks-or-spies': 'error'
}
```

- All rules enforced
- Team understands the patterns
- AI assistance improves noticeably

## Common Patterns

### Creating Test Factories

Instead of mocks, create factory functions:

```typescript
// test-factories/user.ts
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  };
}

// In your tests
const user = createTestUser({ name: 'Alice' });
```

### Managing Dependencies

When dependencies are flagged as outdated:

```bash
# Don't manually update package.json
# Instead, use interactive mode
pnpm deps:interactive

# This will guide you through decisions:
# - Keep current version (with reason)
# - Update to latest
# - Update to specific version
# - Schedule for later review
```

### Working with AI

When AI suggests using mocks:

```
AI: "Here's a test using jest.mock..."
You: "We use the no-mocks pattern. Please rewrite using factory functions."
```

When AI suggests npx:

```
AI: "Run `npx create-react-app`..."
You: "We don't use npx. Please use pnpm exec or add to devDependencies."
```

## Next Steps

1. **Read the Philosophy**: Understand why these patterns matter - see [docs/PHILOSOPHY.md](./PHILOSOPHY.md)
2. **Explore the Rules**: Full documentation at [docs/guides/RULES_REFERENCE.md](./guides/RULES_REFERENCE.md)
3. **Learn the Workflow**: Two-phase development process at [docs/DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
4. **Join the Community**: Share your experience and get help

## Getting Help

- **Rule Documentation**: Each rule has detailed docs with examples
- **Error Messages**: Provide actionable guidance and links
- **Examples**: See the `examples/` directory for real usage
- **Issues**: Report problems at [GitHub Issues](https://github.com/shared-lints/shared-lints/issues)

## FAQ

**Q: Do I have to adopt all rules at once?**
A: No! Start with warnings and adopt gradually. Even one rule provides value.

**Q: Will this slow down development?**
A: Initially there's a learning curve, but it speeds up development long-term by preventing AI mistakes and improving code quality.

**Q: Can I customize the rules?**
A: Yes! All rules have configuration options. You can also disable rules that don't fit your project.

**Q: What if I really need mocks for something?**
A: You can disable the rule for specific files or create your own testing patterns. The framework is flexible.

---

Ready to start? Install the packages and run your first lint! 🚀
