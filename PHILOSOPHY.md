# Philosophy: Enforced Explicit Decisions for LLM-Assisted Development

## The Core Problem

**LLMs are excellent at pattern matching but poor at understanding human context around technical decisions.**

When Claude sees outdated dependencies, it pattern-matches to "outdated = bad, should update." It doesn't know about deliberate version pinning, integration concerns, or team coordination needs. The AI treats these as pure technical problems when they're actually coordination problems—decisions that affect multiple people over time.

## The Solution: Enforced Explicit Decision Pattern

This project implements tooling that makes implicit decisions become hard failures that LLMs cannot ignore.

### Key Principles

1. **Hard Failures Over Warnings**: The system must actually fail in a way the AI can't ignore. Not warnings. Hard failures.

2. **Clear Guidance**: Error messages communicate project goals and provide actionable next steps, not just complaints about violations.

3. **Context Documentation**: Decisions are documented with reasoning, ownership, and expiration dates.

4. **Auto-fix When Possible**: Where there's a clear "right" answer, provide automatic fixes. Where context matters, force explicit decisions.

5. **Periodic Review**: Old decisions expire and must be reconsidered, preventing technical debt accumulation.

## How This Manifests in Linting Rules

### No-Mocks Philosophy

```typescript
// ❌ Forbidden - AI might cargo-cult testing patterns
import { jest } from '@jest/globals';
const mockFn = jest.fn();

// ✅ Enforced - Explicit test data creation
import { createTestUser } from './test-factories';
const user = createTestUser({ name: 'John' });
```

**Why**: Mocking frameworks encourage implicit assumptions about implementation details. Factory functions force explicit modeling of test scenarios and make test intent clear to both humans and AI.

### Explicit TypeScript Imports

```typescript
// ❌ Forbidden - AI might make wrong assumptions about file types
import { utils } from './utils';

// ✅ Enforced - Clear about what's being imported
import { utils } from './utils.ts';
```

**Why**: Explicit extensions eliminate ambiguity about module resolution. AI assistants can understand the import graph without guessing file extensions.

### No NPX Usage

```bash
# ❌ Forbidden - AI might install random packages
npx some-tool --flag

# ✅ Enforced - Explicit package management
pnpm add -D some-tool
pnpm exec some-tool --flag
```

**Why**: NPX executes arbitrary code from the internet. Explicit dependency management ensures all tools are declared, versioned, and auditable.

## The AI Learning Effect

After encountering these patterns a few times, LLMs internalize project context:

- **Dependency changes** → Ask for explicit decisions
- **Test patterns** → Use factory functions, not mocks  
- **Module imports** → Include explicit extensions
- **Tool usage** → Check package.json before suggesting commands

## What Makes This Work

### 1. Failure-Driven Guidance

The AI runs `pnpm lint` and gets hard failures with clear messages:

```
✖ 3 dependencies are outdated and require explicit decisions per project policy
  Run `pnpm deps:interactive` to document your choices
  
✖ Mock usage detected in test file
  Use factory functions instead: see docs/testing-philosophy.md
```

### 2. Decision Documentation

Every explicit decision gets logged:

```json
{
  "dependency": "@types/node",
  "decision": "keep", 
  "reason": "Version 20 breaks our Docker build",
  "reviewer": "yehuda",
  "expiresAt": "2025-08-26"
}
```

### 3. Expiring Context

Decisions automatically expire, forcing periodic reconsideration. This prevents:

- Stale technical decisions accumulating as debt
- Context degradation over time
- Assumptions becoming invisible

## Benefits for Human Developers

This isn't just about AI—the same improvements that help AI understand project context also improve the human development experience:

- **Visible technical debt**: All compromises are documented with reasoning
- **Onboarding clarity**: New developers can see why decisions were made
- **Reduced cognitive load**: Less guessing about implicit project conventions
- **Better code reviews**: Discussions focus on documented decisions, not undocumented assumptions

## When to Apply This Pattern

**Good candidates for enforcement:**

- Dependency management (version updates, new packages)
- Testing approaches (mocking vs real implementations)
- Architecture decisions (file organization, module boundaries)
- Tool selection (build systems, formatters, linters)

**Poor candidates:**

- Pure style preferences (spaces vs tabs)
- Mechanical transformations (code formatting)
- Domain-specific logic (business rules)

## The Meta-Pattern

1. **Identify where assumptions get made** - Usually during maintenance or refactoring
2. **Make the system fail when decisions aren't documented** - Hard lint failures
3. **Provide tools that make good decisions easy** - Interactive prompts, clear documentation
4. **Force periodic review of old choices** - Expiring decisions, automated reminders

## Implementation Philosophy

The linting rules in this project embody these principles:

- **Strict by default**: Better to over-enforce and relax than under-enforce and regret
- **Clear error messages**: Explain the WHY and provide actionable HOW
- **Auto-fix where unambiguous**: Reduce friction for clear cases
- **Force explicit choice where context matters**: Make humans make the call

This creates a feedback loop where AI assistants learn project context through encountering and respecting these explicit decision points.

## The Bigger Picture

Traditional development workflows evolved for human-to-human coordination. AI needs different feedback loops—ones that make human context explicit enough for AI to understand and respect it.

This isn't about making AI smarter about human context. It's about making human context explicit enough that AI can work with it effectively.

The goal: Projects that feel intentional rather than randomly evolved, whether developed by humans or AI.
