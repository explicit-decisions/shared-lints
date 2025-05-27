# explicit-decisions

> ESLint configurations and tooling that enforce explicit technical decisions for LLM-assisted development

## Why explicit-decisions?

When working with AI assistants, **implicit decisions become hard failures**. LLMs excel at pattern-matching but miss the human context around technical choices. This framework forces every decision to be explicit and documented, preventing AI from making poor assumptions.

## Quick Start

**We recommend pnpm** for better dependency management:

```bash
# Install in your TypeScript/JavaScript project
pnpm add -D @explicit-decisions/tooling @explicit-decisions/eslint-config

# One command setup - ESLint configuration happens automatically!
pnpm exec explicit-decisions init

# Start enforcing explicit decisions immediately
pnpm lint
```

*Works with npm and yarn too, but pnpm provides better workspace support and faster installs.*

## What You Get

### 🔧 ESLint Rules That Enforce Explicit Decisions

**Code Quality & Structure:**

- **`prefer-ts-imports`** - Auto-fixes `.js` imports to `.ts` when TypeScript files exist
- **`require-ts-extensions`** - Enforces explicit file extensions in imports  
- **`no-npx-usage`** - Prevents `npx` usage, enforces explicit package management

**Testing Philosophy (No-Mocks Approach):**

- **`no-mocks-or-spies`** - Prevents test mocking, enforces real implementations
- **`require-factory-functions`** - Guides toward factory functions for test data
- **`no-any-in-tests`** - Enforces TypeScript strictness in test files
- **`prefer-real-implementations`** - Suggests dependency injection patterns

### 📋 Dependency Management with Decision Tracking

Every dependency update requires an explicit decision:

```bash
# Interactive dependency management
pnpm deps:interactive

# Lint fails if decisions aren't documented
pnpm lint  # ❌ Fails on undocumented dependencies
```

Decisions are tracked in `dependency-versions.json`:

```json
{
  "react": {
    "currentVersion": "^18.2.0",
    "latestAvailable": "^19.0.0", 
    "reason": "REVIEWED: Waiting for ecosystem stability",
    "reviewDate": "2025-05-26",
    "status": "blocked"
  }
}
```

### 🚀 CLI Tools for Easy Adoption

```bash
# Project setup (automatically configures ESLint!)
explicit-decisions init

# Dependency management  
explicit-decisions deps check
explicit-decisions deps interactive

# Testing setup (with no-mocks philosophy)
explicit-decisions init --testing vitest  # Vitest with factory functions
explicit-decisions init --testing jest    # Jest with real implementations
explicit-decisions init --testing none    # Skip testing setup

# Reference repository management
pnpm refs:link    # Symlink for direct editing (migration work)
pnpm refs:sync    # Snapshot for analysis (documentation)

# Get help
explicit-decisions --help
```

## Philosophy: Phase-Based Development

The framework enforces a two-phase development methodology:

### Exploration Phase: "Make it Work"

- Rapid prototyping with AI assistance
- Focus on functionality over perfection
- Time-boxed sessions

### Consolidation Phase: "Make it Right"

- Transform prototypes into production code
- Extract proper abstractions
- Document all decisions
- **MANDATORY** before committing

See [Phase-Based Development](docs/PHASE_BASED_DEVELOPMENT.md) for details.

## Installation and Setup

### 1. Install Packages

We recommend **pnpm** for better dependency management:

```bash
pnpm add -D @explicit-decisions/tooling @explicit-decisions/eslint-config eslint
```

*Note: The framework supports npm and yarn, but pnpm provides better workspace support and faster installs.*

### 2. Initialize Your Project

```bash
pnpm exec explicit-decisions init
```

This **automatically** creates:

- `eslint.config.js` with explicit-decisions rules **pre-configured** (no user input needed!)
- `dependency-versions.json` for tracking decisions (optional)
- Updated `package.json` scripts
- Proper `.gitignore` entries

### 3. Start Using

```bash
# Check your code
pnpm lint

# Manage dependencies  
pnpm deps:interactive

# All checks pass? You're enforcing explicit decisions! ✅
```

## How It Works

### Dependency Management

1. **Detection**: Uses `npm-check-updates` to find outdated packages
2. **Decision Tracking**: Documents why each package is kept at current version
3. **Enforcement**: Lint fails if decisions are missing or stale (>30 days)
4. **Review Cycle**: Forces regular review of dependency decisions

### ESLint Integration

- Rules fail on **implicit choices** (like `.js` imports when `.ts` exists)
- Auto-fixes enforce **explicit decisions** (like proper import extensions)
- Integrates with existing ESLint configurations

### CLI Tools

- **Interactive setup** for new projects
- **Dependency workflows** that guide decision-making
- **Schema validation** ensures consistent decision tracking

## Example Workflow

```bash
# Daily development
git checkout -b feature/user-auth

# Exploration: prototype quickly with AI
# ... rapid development ...

# Consolidation: make it production-ready
pnpm lint                    # ❌ Fails on console.log in src/
pnpm deps:interactive        # 📝 Document dependency decisions  
pnpm test                    # 🧪 Ensure test coverage

# Only commit when all explicit decisions are made
git commit -m "Add user authentication

Consolidation complete:
- All dependencies reviewed and documented
- Console logging replaced with structured logging
- Test coverage: 85%"
```

### Tag-Based Update Policies

You can configure dependencies to automatically update when they reach specific npm dist-tags:

```json
{
  "dependencies": {
    "some-package": {
      "currentVersion": "^2.1.0",
      "latestAvailable": "^3.0.0",
      "reason": "Waiting for v3 to reach stable tag before upgrading",
      "reviewDate": "2025-05-27",
      "reviewer": "developer",
      "updatePolicy": {
        "type": "tag-based",
        "targetTag": "stable",
        "checkInterval": "weekly"
      }
    }
  }
}
```

When the target tag is satisfied, the dependency checker will notify you:

```bash
❌ Dependency policy violations found:
1. Tag-based policy satisfied: stable tag now points to ^3.0.0
   🎯 Update ready! Run 'pnpm deps:interactive' to upgrade to stable tag
```

## Testing Philosophy: No-Mocks Approach

The explicit-decisions framework enforces a **no-mocks testing philosophy** that promotes better design and more reliable tests.

### Core Principles

1. **No Mocks/Spies** - Never use `jest.fn()`, `sinon`, or similar mocking libraries
2. **Factory Functions** - Use factory functions for test data creation  
3. **Real Implementations** - Create real test implementations of external dependencies
4. **Type Safety** - Tests follow the same TypeScript strictness as production code

### Why No Mocks?

**Problems with traditional mocking:**

- Creates false confidence - tests pass but code is broken
- Requires maintaining mock behavior alongside real behavior
- Makes refactoring harder due to brittle test coupling
- Leads to poor design (hard-to-test code gets mocked instead of refactored)

**Benefits of real implementations:**

- Tests catch real integration issues
- Encourages better architecture through dependency injection
- Tests become documentation of actual behavior
- Refactoring is safer and easier

### Automatic Setup

When you run `explicit-decisions init --testing vitest`, you get:

**Generated test utilities:**

```typescript
// src/test-utils/factories.ts
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// Real implementation for testing
export class TestLogger {
  public logs: string[] = [];
  
  info(message: string): void {
    this.logs.push(\`INFO: \${message}\`);
  }
  
  clear(): void {
    this.logs = [];
  }
}
```

**Vitest configuration with strict coverage:**

```typescript
// vitest.config.ts (auto-generated)
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
});
```

### ESLint Enforcement

The framework includes ESLint rules that enforce these patterns:

```typescript
// ❌ Caught by @explicit-decisions/no-mocks-or-spies
const mockFn = jest.fn();
const spy = sinon.spy(obj, 'method');

// ❌ Caught by @explicit-decisions/no-any-in-tests
const testData: any = { ... };

// ✅ Encouraged by @explicit-decisions/require-factory-functions
const user = createTestUser({ name: 'Custom Name' });

// ✅ Encouraged by @explicit-decisions/prefer-real-implementations
const logger = new TestLogger();
const userService = new UserService(logger);
```

### Design Philosophy: Guidance Over Automation

**Critical principle: Auto-fixes must be 100% reliable.**

Developers and AI assistants run `pnpm lint:fix` automatically, expecting it to always improve code and never break it. One unreliable auto-fix destroys trust in the entire system.

**What ESLint auto-fixes (100% reliable only):**

- ✅ Import ordering and formatting - deterministic, safe
- ✅ Simple syntax corrections - well-understood transformations
- ✅ File extension consistency - clear project conventions

**What ESLint guides (no auto-fix):**

- 🤔 Dependency injection patterns - requires architectural decisions
- 🤔 Factory function extraction - requires design judgment  
- 🤔 Test structure improvements - requires human context
- 🤔 Any change that could fail in edge cases or different codebases

**Reliability tests for auto-fixes:**

```bash
# Every auto-fix must pass these tests:
pnpm lint:fix
pnpm lint:fix    # Idempotent - no additional changes
pnpm test        # No regressions introduced
```

This approach ensures that **humans make the important decisions** while tooling provides **rock-solid automation** for mechanical tasks.

## Benefits

### For AI-Assisted Development

- **Prevents bad assumptions** by forcing explicit choices
- **Preserves human context** that LLMs miss
- **Improves future AI interactions** through better documented decisions

### For Teams

- **No surprise dependency issues** - all updates are consciously decided
- **Documented technical debt** with reasons and review dates
- **Consistent code quality** enforced by tooling

### For Maintainability

- **Time-bounded decisions** prevent technical debt accumulation
- **Schema-validated tracking** ensures consistent documentation
- **Automated enforcement** prevents quality drift

## Configuration

### ESLint Configuration

The `explicit-decisions init` command automatically creates this configuration:

```javascript
// eslint.config.js (auto-generated)
import explicitDecisions from '@explicit-decisions/eslint-config';

export default [
  ...explicitDecisions,
  
  // Project-specific overrides
  {
    rules: {
      // Customize explicit-decisions rules as needed
      // '@explicit-decisions/prefer-ts-imports': 'error',
      // '@explicit-decisions/no-mocks-or-spies': 'error',
      // '@explicit-decisions/require-ts-extensions': 'error',
      // '@explicit-decisions/no-npx-usage': 'error',
    }
  }
];
```

### Dependency Rules

```json
// dependency-versions.json
{
  "rules": {
    "allowedOutdatedDays": 30,
    "requireReasonForOld": true,
    "blockMajorUpdatesWithoutReview": true
  }
}
```

## Migration from Existing Projects

1. **Install packages** and run `explicit-decisions init` (automatically configures ESLint)
2. **Document current dependencies** with `pnpm deps:interactive`
3. **Fix ESLint violations** (auto-fixable rules help here)
4. **Update CI/CD** to include `pnpm lint` (which now includes dependency checking)

Most ESLint rules are auto-fixable, making migration straightforward.

## Roadmap

**Current** (v1.0):

- ✅ 4 core ESLint rules
- ✅ Complete dependency management system
- ✅ CLI tools and project setup
- ✅ Phase-based development methodology

**Near-term** (v1.1):

- 🔄 Additional ESLint rules (`no-console-in-library`, `no-large-files`)
- 🔄 Automated consolidation checklist
- 🔄 Enhanced error messages and guidance

**Future**:

- Integration with popular TypeScript configurations
- Support for additional package managers
- Team collaboration features

## Contributing

This project follows its own explicit-decisions methodology:

1. **Exploration phase**: Prototype new features quickly
2. **Consolidation phase**: Extract proper abstractions, add tests, document decisions
3. **All dependencies** must be explicitly reviewed and documented
4. **All commits** must pass the full lint pipeline

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](LICENSE) for details.

---

**Built with explicit-decisions**: This project uses its own framework to enforce explicit technical decisions. Every dependency update, import decision, and technical choice is documented and enforced by the build pipeline.
