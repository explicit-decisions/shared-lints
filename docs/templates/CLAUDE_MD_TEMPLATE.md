# LLM Instructions Template

**Copy this into your project's CLAUDE.md file and customize the placeholders marked with `[CUSTOMIZE]`**

## Core Philosophy: The Enforced Explicit Decisions Pattern

**LLMs are excellent at pattern matching but poor at understanding human context around technical decisions.**

This project implements the **"Enforced Explicit Decisions" pattern** - making implicit decisions become hard failures that LLMs cannot ignore. The pattern creates a coordination protocol where humans maintain decision authority while AI assistants get the explicit context needed for better assistance.

See `PHILOSOPHY.md` for the complete philosophy behind the Enforced Explicit Decisions framework.

## Critical Rules for AI Assistants

### 🚨 PACKAGE MANAGEMENT 🚨

**NEVER use `npx` or `pnpx`** - always use `pnpm exec` or direct `pnpm` commands:

❌ **FORBIDDEN**: `npx anything`, `pnpx anything`  
✅ **CORRECT**: `pnpm exec anything`, `pnpm run script-name`

### 🚨 DEPENDENCY MANAGEMENT 🚨

**When you encounter dependency lint failures**:

1. **NEVER update dependencies manually**
2. **STOP and ask the user** before running any dependency commands
3. **Guide users to interactive mode**: `pnpm deps:interactive` (if available)
4. **Let humans make the decisions** about version updates

### 🚨 TESTING PHILOSOPHY 🚨

**No-mocks policy** - Use factory functions and real implementations:

❌ **Forbidden**:

```typescript
import { jest } from '@jest/globals';
const mockFn = jest.fn();
vi.mock('./module');
```

✅ **Preferred**:

```typescript
import { createTestUser } from './test-factories';
const user = createTestUser({ name: 'John' });
```

### 🚨 TYPE SAFETY 🚨

**Strict TypeScript enforcement**:

- No `any` types
- Explicit return types for functions
- Explicit `.ts` extensions for imports
- Type-only imports where applicable

## Development Standards

### TypeScript

- **Strict typing**: Explicit interfaces, no `any`, explicit return types
- **Private syntax**: Use `#private` fields over `private` keywords
- **Import consistency**: Use `.ts` extensions for local imports
- **Type imports**: Use `import type` for type-only imports

### Code Quality

- **Follow existing patterns** - Understand first, suggest later
- **Match established conventions** in the codebase
- **Never suppress linting rules** without explicit instruction
- **Ask clarifying questions** when requirements are unclear

### Testing Approach

- **Co-located tests** (`*.test.ts`) for unit tests
- **Factory functions over mocks** for test data
- **Arrange-Act-Assert pattern** with focused scope
- **Custom matchers** where available for domain-specific testing

### Dependencies

- **Only use existing packages** in the project
- **Request permission** before adding new dependencies
- **Check existing implementations** before suggesting new libraries

## Workflow Requirements

### Scope Management

- **Focus exclusively** on defined tasks
- **Request approval** before expanding scope or architectural changes
- **Avoid scope creep** during implementation

### Communication

- **Use clear, concise explanations** with bullet points for complexity
- **Provide reasoning** for suggestions and changes
- **Ask questions** rather than making assumptions

### Git Practices

- **Follow Conventional Commits**: `feat/fix/docs/style/refactor/test/chore`
- **Use descriptive commit messages** that explain the "why"
- **Review changes** before committing

## Common Development Commands

```bash
# [CUSTOMIZE] - Replace with your project's commands
pnpm install                 # Install dependencies
pnpm build                   # Build the project
pnpm test                    # Run tests
pnpm lint                    # Run linting
pnpm lint:fix               # Auto-fix linting issues
pnpm lint:strict            # Fail on any warnings
pnpm typecheck              # TypeScript checking
pnpm dev                    # Development mode

# If using dependency management system:
pnpm deps:interactive       # Make dependency decisions
pnpm lint:deps             # Check dependency decisions
```

## Project-Specific Context

### [CUSTOMIZE] - Architecture Overview
<!-- Describe your project's architecture, key concepts, and design patterns -->

### [CUSTOMIZE] - Key Components
<!-- List and describe the main components, services, or modules -->

### [CUSTOMIZE] - Common Patterns
<!-- Document frequently used patterns, conventions, or utilities -->

### [CUSTOMIZE] - Domain Knowledge
<!-- Include any domain-specific knowledge that helps with development -->

## Linting Rules Enforced

This project uses `@explicit-decisions/eslint-config` and `@explicit-decisions/eslint-plugin` which implement the Enforced Explicit Decisions pattern through:

### No-Mocks Rule (`shared-lints/no-mocks-or-spies`)

Prevents use of mocking libraries, enforcing factory functions and real implementations as part of the explicit testing philosophy.

### TypeScript Extensions (`shared-lints/require-ts-extensions`)

Requires explicit `.ts` extensions for local TypeScript imports, eliminating module resolution ambiguity.

### No NPX Usage (`shared-lints/no-npx-usage`)

Prevents arbitrary code execution via npx, enforcing explicit dependency management decisions.

## AI Assistant Memory Notes

### [CUSTOMIZE] - Project Preferences
<!-- Add specific preferences, patterns, or decisions that should be remembered -->

### [CUSTOMIZE] - Anti-Patterns to Avoid
<!-- Document what NOT to do in this specific project -->

### [CUSTOMIZE] - Decision History
<!-- Key architectural or technical decisions that inform future work -->

## Error Handling Patterns

### [CUSTOMIZE] - Error Conventions
<!-- Document how errors should be handled, logged, and propagated -->

### [CUSTOMIZE] - Logging Standards
<!-- Describe logging practices, levels, and conventions -->

## Performance Considerations

### [CUSTOMIZE] - Performance Requirements
<!-- Any specific performance requirements or constraints -->

### [CUSTOMIZE] - Optimization Patterns
<!-- Common optimization techniques used in the project -->

---

**Remember: The goal is making human context explicit enough for AI to understand and respect it, not making AI smarter about human context.**
