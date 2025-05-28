# AI Collaboration Guide

*How to work effectively with AI assistants using the Enforced Explicit Decisions framework*

## Core Philosophy: The Enforced Explicit Decisions Pattern

This project implements the **"Enforced Explicit Decisions" pattern** - making implicit decisions become hard failures that AI assistants cannot ignore. The goal is to make human context explicit enough for AI to understand and respect it, not to make AI smarter about human context.

**The Enforced Explicit Decisions Framework** creates a coordination protocol between humans and AI where:

- Humans maintain full decision authority while AI gets explicit context
- Implicit assumptions become hard failures that force documentation
- Both stakeholders work within a shared understanding of project constraints

- **Humans remain in full control** of all architectural and strategic decisions
- **AI receives explicit context** about project constraints and priorities
- **Hard failures enforce compliance** with documented decisions
- **Both humans and AI benefit** from reduced context-switching and clearer communication

## Critical Rules for AI Assistants

### 🚨 Package Management

**NEVER use `npx` or `pnpx`** - always use `pnpm exec` or direct `pnpm` commands:

```bash
❌ FORBIDDEN: npx create-react-app
❌ FORBIDDEN: pnpx prettier --write

✅ CORRECT: pnpm exec create-react-app
✅ CORRECT: pnpm exec prettier --write
✅ CORRECT: pnpm run format
```

**Why**: NPX executes arbitrary code from the internet. Our ESLint rules will fail the build if npx usage is detected.

### 🚨 Dependency Updates

**When AI encounters dependency lint failures**:

1. **NEVER update dependencies manually** in package.json
2. **STOP and inform the user** about outdated dependencies
3. **Guide users to interactive mode**: `pnpm deps:interactive`
4. **Let humans make the decisions** about version updates

**Example AI response**:

```
I see there are outdated dependencies flagged by the linter:
- @types/node (current: 20.0.0, latest: 22.0.0)
- vitest (current: 1.0.0, latest: 2.0.0)

Run `pnpm deps:interactive` to review and document your update decisions.
Each dependency requires an explicit decision with rationale.
```

### 🚨 Testing Approach

**No-mocks policy** - Use factory functions and real implementations:

```typescript
❌ FORBIDDEN:
import { jest } from '@jest/globals';
const mockFn = jest.fn();
vi.mock('./user-service');
sinon.stub(database, 'query');

✅ REQUIRED:
import { createTestUser } from './test-factories';
import { InMemoryDatabase } from './test-utils/in-memory-database';
const user = createTestUser({ name: 'Test User' });
const db = new InMemoryDatabase();
```

**Why**: Mocks couple tests to implementation details. Real implementations and factories make tests more reliable and understandable to both humans and AI.

### 🚨 TypeScript Extensions

**Always use explicit `.ts` extensions for local imports**:

```typescript
❌ FORBIDDEN: import { utils } from './utils';
✅ REQUIRED: import { utils } from './utils.ts';
```

**Why**: Explicit extensions eliminate ambiguity about module resolution and improve AI's understanding of the import graph.

## Development Standards for AI

### When AI Should Ask for Clarification

1. **Before adding any new dependency** - even dev dependencies
2. **When requirements seem to conflict** with existing patterns
3. **Before making architectural changes** beyond the immediate task
4. **When multiple valid approaches exist** and context matters
5. **Before removing or modifying** existing safety checks

### Code Generation Guidelines

#### Exploration Phase

When user indicates exploration phase:

- Prioritize working functionality over perfect code
- Use TODO comments liberally
- Skip comprehensive error handling initially
- Generate multiple approach options
- Don't worry about perfect TypeScript types

#### Consolidation Phase

When user indicates consolidation phase:

- Follow all project standards strictly
- Ensure comprehensive error handling
- Add proper TypeScript types throughout
- Include meaningful tests
- Document all decisions

### Pattern Recognition

AI should recognize and follow these patterns:

#### Import Organization

```typescript
// 1. Node built-ins
import fs from 'fs';
import path from 'path';

// 2. External dependencies
import { ESLintUtils } from '@typescript-eslint/utils';

// 3. Internal imports with .ts extensions
import { createRule } from './utils/rule-factory.ts';
import type { Options } from './types.ts';
```

#### Error Messages

```typescript
// Provide actionable guidance, not just complaints
messages: {
  noMocks: 'Avoid mocks - use real implementations or dependency injection. See: https://github.com/explicit-decisions/shared-lints/blob/main/docs/guides/TESTING_PHILOSOPHY.md',
}
```

## Working with Project Tools

### Common Commands AI Should Know

```bash
# Development
pnpm install          # Install dependencies
pnpm build           # Build all packages
pnpm test            # Run all tests
pnpm lint            # Check code quality
pnpm lint:fix        # Auto-fix issues
pnpm typecheck       # TypeScript validation

# Dependency Management
pnpm deps:interactive # Make dependency decisions
pnpm deps:check      # Review dependency status

# Reference Repositories
pnpm refs:sync       # Update reference examples
pnpm refs:link       # Link for development
```

### When to Suggest Which Command

- **User mentions outdated packages**: Suggest `pnpm deps:interactive`
- **Lint errors appear**: First try `pnpm lint:fix`, then manual fixes
- **Type errors**: Run `pnpm typecheck` for full picture
- **Test failures**: Run `pnpm test` with specific file paths

## Context for Better AI Assistance

### Project Structure Understanding

This is a monorepo with three main packages:

1. **@explicit-decisions/eslint-plugin**: Custom ESLint rules
2. **@explicit-decisions/eslint-config**: Shareable ESLint configurations
3. **@explicit-decisions/tooling**: CLI tools for setup and management

### Key Concepts to Understand

1. **Explicit Decisions**: Every non-standard choice must be documented
2. **Two-Phase Development**: Exploration then consolidation
3. **Three-Tier Priorities**: High-leverage → Foundation → New features
4. **Platform-First**: Prefer built-in features over dependencies

### Decision Documentation Examples

When AI needs to help document decisions:

```json
{
  "dependency": "react",
  "version": "16.14.0",
  "decision": "keep",
  "reason": "Legacy components require React 16 APIs, migration planned Q2 2025",
  "expires": "2025-04-01",
  "reviewer": "team-lead"
}
```

## Common AI Pitfalls to Avoid

### 1. Suggesting Popular Patterns Over Project Patterns

❌ "Most projects use Jest mocks, so here's a mock..."
✅ "Following the project's no-mocks philosophy, here's a factory..."

### 2. Adding Dependencies Without Discussion

❌ "I'll add lodash for this utility function"
✅ "This could use lodash, but let's check if there's a platform alternative first"

### 3. Ignoring Lint Errors

❌ "The linter complains but the code works"
✅ "Let's fix these lint errors - they enforce important project decisions"

### 4. Making Assumptions About Intent

❌ "You probably want the latest version of everything"
✅ "I see outdated dependencies. Would you like to run `pnpm deps:interactive` to review them?"

## Effective AI Prompts for This Project

### For Exploration Phase

```
I'm in exploration phase working on [feature].
Time-box: [duration]
Goal: Get a working prototype that [requirement]
Don't worry about perfect code quality yet.
```

### For Consolidation Phase

```
I'm in consolidation phase refining [feature].
This needs to be production-ready following all project standards.
Current status: [what works from exploration]
Help me improve: [specific aspects]
```

### For Dependency Decisions

```
The linter flagged [package] as outdated.
Current: [version], Latest: [version]
Context: [how we use it]
Should we update? What are the trade-offs?
```

## Success Metrics for AI Collaboration

Good AI assistance in this project means:

- Zero suggestions to use npx/pnpx
- Zero mock implementations in tests
- All imports use explicit extensions
- Dependency changes go through `deps:interactive`
- Suggestions align with project principles
- Context is requested when decisions have trade-offs

---

**Remember**: The goal is to make human context explicit enough that AI can work with it effectively. When in doubt, ask for clarification rather than making assumptions.
