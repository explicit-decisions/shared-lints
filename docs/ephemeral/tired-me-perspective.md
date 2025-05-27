# The "Tired Me" Perspective: Yehuda Katz on Developer Experience

## A Historical Design Philosophy

The "tired me" test is a design principle that has guided Yehuda's work for decades—long before AI assistants existed. From Ember's conventions to Cargo's clear commands to Rust's helpful error messages, this philosophy has always been about making tools that work for developers in all cognitive states.

The principle: tools and systems should be usable not just by alert, caffeinated developers at their peak, but by exhausted developers at 3 AM dealing with production issues, or returning to code after months away.

## Key Appearances in AUTHOR_PERSPECTIVE.md

### 1. Future Self as Primary User

> "I am my own biggest consumer of this context. My future self, three months from now, won't remember why I pinned that dependency or used that 'unusual' pattern."

### 2. Context Loss Over Time

> "When I come back to the code weeks later—or when AI assists me—that context is gone."

### 3. Error Messages as Tired-Me Documentation

> "Clear enough for Claude to implement, clear enough for a junior developer to follow, **clear enough for you when you're tired**."

## The "Tired Me" Personas

### 1. **Three-Months-Later Me**

- Has completely forgotten the specific constraints that led to decisions
- Doesn't remember which dependencies are pinned for compatibility vs security
- Can't recall why a "weird" pattern was necessary
- Needs explicit reminders of context, not just code comments

### 2. **End-of-Sprint Me**

- Mentally exhausted from a week of complex work
- Cognitive capacity depleted
- Still needs to ship features without breaking things
- Can follow clear instructions but can't derive complex reasoning

### 3. **Emergency-Fix Me**

- It's 2 AM and production is down
- Adrenaline and panic competing with exhaustion
- Needs unambiguous guidance
- Cannot afford to make wrong assumptions

### 4. **Context-Switching Me**

- Just jumped from a Rust project to a JavaScript project
- Mental model still partially in the previous language/framework
- Needs strong guardrails to prevent cross-contamination of patterns
- Benefits from explicit "this is different because..." messages

## Design Implications

### 1. **Cognitive Load Must Be Minimal**

When tired, working memory shrinks. Design decisions that seem obvious when alert become opaque when exhausted. This drives:

- Single, clear actions in error messages
- No mental math or complex reasoning required
- Direct links to solutions, not just problem descriptions

### 2. **Explicitness Over Inference**

Tired developers can't infer intent from code structure. They need:

- Decisions spelled out in error messages
- Context provided at point of use
- No reliance on "you'll remember why"

### 3. **Guardrails Not Guidelines**

Tired developers miss guidelines but hit guardrails:

- Hard failures over warnings
- Impossible to do the wrong thing accidentally
- Force conscious decision at time of violation

### 4. **Self-Documenting Enforcement**

The enforcement IS the documentation:

- Error messages explain the why
- Tools guide to the solution
- No separate documentation to maintain or forget

## Examples from Yehuda's Framework

### Dependency Version Decision

```
✖ Dependency @types/node is outdated (^20.0.0 → ^22.0.0)
  Decision required: Run 'pnpm deps:interactive' to document your choice
  Context: This affects TypeScript definitions for Node.js APIs
```

**Why this works for tired me:**

- States the problem clearly
- Provides exact command to run
- Explains impact without requiring research
- Forces explicit decision, preventing accidental updates

### Mock Usage Detection

```
✖ Mock usage detected in test file
  Use factory functions instead: see docs/testing-philosophy.md
  Replace jest.fn() with createTestUser() from './test-factories'
```

**Why this works for tired me:**

- Identifies exact problem
- Provides specific replacement
- Links to philosophy (for when I have energy)
- Shows exact code change needed

## The Philosophy

"Tired me" isn't about dumbing things down—it's about recognizing that:

1. **Cognitive capacity is variable** - We're not always at peak performance
2. **Context is perishable** - What's obvious today is mysterious in 6 months
3. **Future self is a different person** - With different pressures and priorities
4. **Good DX serves all states** - Peak performance AND exhausted maintenance

## Historical Evolution

This philosophy has evolved through Yehuda's projects over the years:

- **Early Rails/jQuery work**: Making frameworks accessible to non-experts
- **Ember's conventions** (2011+): Reduce decisions when tired
- **Cargo's clarity** (2014+): Obvious what commands do, no ambiguity
- **Rust's error messages** (2014+): Guide to solutions, don't just state problems
- **This framework** (2024): Apply same principles to AI collaboration

The philosophy predates AI by over a decade, but it turns out to be perfectly suited for AI collaboration.

## The Ultimate Test

Before shipping any developer experience:
> "Will this help me when I'm exhausted, stressed, and have forgotten everything about why I made these decisions?"

If the answer is no, the tool isn't finished yet.

## Why This Philosophy is Perfect for AI

The "tired me" perspective predates AI assistants by years, but it turns out to be the perfect mental model for AI collaboration. Why? Because AI is effectively always in a "tired" state:

- **No implicit memory**: Like three-months-later me, AI doesn't remember why decisions were made
- **No context inference**: Like emergency-fix me, AI can't afford to make assumptions
- **Needs explicit guidance**: Like end-of-sprint me, AI needs clear, unambiguous instructions
- **Context switches constantly**: Like context-switching me, AI jumps between projects without carrying context

This is why "what's good for AI is good for humans"—not because Yehuda designed it that way, but because his longstanding philosophy of designing for cognitively-limited humans naturally serves cognitively-limited AI.

## Key Insight

The "tired me" perspective isn't pessimistic—it's realistic and prescient. A philosophy developed for human limitations turns out to be exactly what we need for AI collaboration. By designing for the worst case (exhausted humans), we inadvertently designed for the AI case too.
