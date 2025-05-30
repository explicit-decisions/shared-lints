# Principle: Think Before Acting

## Overview

This principle requires developers (both human and AI) to pause and ensure they understand the problem before implementing a solution. It's a direct counter to "vibe coding" - the practice of making changes until something works without understanding why.

## The Problem

When faced with an error or unexpected behavior, it's tempting to:

- Try random fixes until something works
- Copy solutions from StackOverflow without understanding them
- Make assumptions about the problem without verification
- Apply brute-force solutions instead of addressing root causes

This leads to:

- Fragile code that breaks in unexpected ways
- Solutions that don't actually solve the real problem
- Technical debt from workarounds
- Missed opportunities for better solutions

## The Principle

**Before implementing any solution:**

1. **Take a step back** - Don't rush into coding
2. **Understand the problem** - What's actually happening vs. what should happen?
3. **Verify your understanding** - Are you solving the right problem?
4. **Ask when uncertain** - It's better to clarify than to guess
5. **Investigate root causes** - Don't just fix symptoms

## Examples

### Bad: Mashing Until It Works

```javascript
// Error: Cannot read property 'name' of undefined
// ❌ Just add checks everywhere
if (user && user.name) {
  console.log(user.name);
}
if (user?.profile?.name) {
  console.log(user.profile.name);
}
// Still broken? Add more checks...
```

### Good: Understanding the Problem

```javascript
// Error: Cannot read property 'name' of undefined
// ✅ First, understand WHY user is undefined
// - Is it an async timing issue?
// - Is it a data structure mismatch?
// - Is it an API change?
// Then implement the appropriate solution
```

## Implementation in Code Reviews

When reviewing code, look for signs of "mashing":

- Multiple similar fixes for the same issue
- Defensive programming without clear reason
- Comments like "not sure why this works"
- Workarounds without explanation

## For AI Assistants

This principle is especially important for AI assistants who might be tempted to generate plausible-looking code without deep understanding. Always:

1. Analyze error messages thoroughly
2. Use available tools to understand code context
3. Ask for clarification when the problem isn't clear
4. Explain your reasoning before implementing

## Enforcement

While this principle is harder to enforce automatically than others, some patterns can be detected:

- Multiple commits fixing the same issue
- Defensive code without clear justification
- Workarounds without documentation

## Related Principles

- [Explicit Over Implicit](./README.md) - Make decisions clear
- [Fail Early](./README.md) - Surface problems immediately
- [Document Decisions](./README.md) - Explain the "why"
