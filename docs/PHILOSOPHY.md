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

**Why**: Using local packages keeps your codebase predictable across machines and easier to bootstrap. NPX executes arbitrary code from the internet, making builds non-deterministic and harder to audit.

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

## ESLint Rule Design: Guidance vs. Automation

### What Should Auto-Fix ✅

**Mechanical, deterministic changes:**

```typescript
// Import ordering - safe, well-understood
import { b } from './b';
import { a } from './a';  // Auto-fix: reorder

// File extensions - clear project convention
import { utils } from './utils';  // Auto-fix: add .ts extension

// Syntax corrections - no ambiguity
const x = 1  // Auto-fix: add semicolon
```

**Characteristics of good auto-fixes:**

- Single correct answer based on project rules
- No architectural implications
- Can be applied consistently without context
- Failure to auto-fix would be annoying busywork

### What Should Guide (No Auto-Fix) 🤔

**Architectural and design decisions:**

```typescript
// ❌ Don't auto-fix dependency injection
import fs from 'fs';  // Guide: suggest injection, but don't automatically change

// ❌ Don't auto-fix factory extraction  
const data = { huge: 'object' };  // Guide: suggest factory, but human decides structure

// ❌ Don't auto-fix test architecture
function complexTest() { /* lots of logic */ }  // Guide: suggest real implementations
```

**Characteristics that require human judgment:**

- Multiple valid approaches depending on context
- Require understanding of business requirements
- Affect code architecture and design patterns
- Need domain knowledge to implement correctly

### The Critical Reliability Requirement

**Auto-fixes must be 100% reliable** because they run automatically in developer workflows:

```bash
# Developers expect this to always improve code, never break it
pnpm lint:fix

# CI/CD pipelines run auto-fixes automatically
- run: pnpm lint:fix && git commit -am "Auto-fix lint issues"

# AI assistants auto-apply fixes without human review
# If fixes are unreliable, trust in the entire system breaks down
```

**Why 100% reliability matters:**

1. **Developer trust** - One bad auto-fix breaks confidence in the entire linting system
2. **CI/CD integration** - Automated pipelines can't recover from broken auto-fixes
3. **AI amplification** - AI assistants will apply bad patterns at scale if they learn from unreliable fixes
4. **Compounding errors** - Unreliable fixes can create cascading problems across codebases

### The Over-Aggressive Auto-Fix Problem

**What we learned:** If auto-fixes are corrupting code, the rules are poorly designed.

**Example of unreliable auto-fix:**

```javascript
// This rule was adding duplicate comments every time it ran
fix(fixer) {
  return fixer.insertTextBefore(node, '// Consider dependency injection\n');
}
// Result: Multiple identical comments, corrupted files after multiple runs
```

**Why this failed the reliability test:**

- Not idempotent (running twice gives different results)
- Assumes knowledge about existing comments
- Modifies code structure without understanding context

**Better approach - guidance only:**

```javascript
// No auto-fix, just clear guidance
context.report({
  node,
  messageId: 'considerDependencyInjection',
  // Human reads message and makes architectural decision
});
```

### Rule Design Guidelines

1. **Auto-fix criteria (ALL must be true):**
   - Is there exactly one correct way to fix this?
   - Can it be applied without understanding business context?
   - Would not auto-fixing create annoying busywork?
   - **Is the fix 100% reliable and idempotent?**
   - **Will the fix never break working code?**
   - **Can the fix be applied safely in any codebase context?**

2. **Reliability tests for auto-fixes:**

   ```bash
   # The fix must pass ALL of these tests:
   
   # 1. Idempotent test
   pnpm lint:fix
   pnpm lint:fix  # Should make no additional changes
   
   # 2. No regression test  
   pnpm test      # Should pass before and after auto-fix
   
   # 3. Multiple codebase test
   # Apply to different codebases - should never break anything
   
   # 4. Edge case test
   # Test with unusual formatting, comments, syntax variations
   ```

3. **Guidance-only criteria (ANY can trigger this):**
   - Are there multiple valid approaches?
   - Does fixing require architectural decisions?
   - Could auto-fixing introduce bugs or poor design?
   - **Could the fix fail in any reasonable codebase scenario?**
   - **Does the fix depend on context not visible in the AST node?**

4. **Error message quality:**
   - Explain WHY the pattern is problematic
   - Provide ACTIONABLE next steps
   - Reference documentation for complex patterns
   - **For guidance-only rules: explain what the developer should consider**

This philosophy ensures ESLint rules **enhance human decision-making** rather than **replace human judgment**.

## The Bigger Picture

Traditional development workflows evolved for human-to-human coordination. AI needs different feedback loops—ones that make human context explicit enough for AI to understand and respect it.

This isn't about making AI smarter about human context. It's about making human context explicit enough that AI can work with it effectively.

The goal: Projects that feel intentional rather than randomly evolved, whether developed by humans or AI.
