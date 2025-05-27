# Phase-Based Development Methodology

*Part of the explicit-decisions framework for LLM-assisted development*

## Overview

Phase-based development is a structured approach to building software with AI assistance that separates **exploration** (rapid prototyping) from **consolidation** (production-ready refinement). This methodology ensures AI-assisted development produces maintainable, production-quality code while maximizing the speed benefits of AI collaboration.

## The Two Phases

### Exploration Phase: "Make it Work"

**Goal**: Get working functionality quickly with AI assistance
**Duration**: Time-boxed sessions (typically 30-90 minutes)
**Mindset**: Rapid iteration, functional over perfect

**Characteristics**:

- Focus on solving the immediate problem
- Allow some technical debt for speed
- Use AI for rapid prototyping and iteration
- Prioritize working code over perfect architecture
- Document decisions and trade-offs as you go

**Allowed during exploration**:

- Quick and dirty implementations
- Temporary workarounds
- Inline TODO comments
- Console logging for debugging
- Any approach that gets to working functionality

**Example exploration session**:

```bash
# Goal: Add user authentication to API
# Time-box: 60 minutes

# AI helps rapidly prototype:
- Basic JWT token generation
- Simple middleware for auth checking
- Quick login/logout endpoints
- Basic error handling

# Result: Working authentication, some rough edges
```

### Consolidation Phase: "Make it Right"

**Goal**: Transform working code into production-ready, maintainable software
**Duration**: Typically follows each exploration session
**Mindset**: Quality, maintainability, and explicit decisions

**Characteristics**:

- Extract meaningful abstractions
- Add comprehensive error handling
- Write production-quality tests
- Document design decisions
- Remove console.* statements from library code
- Ensure explicit decisions are documented

**Required before consolidation complete**:

- [ ] Files under 200 lines
- [ ] Functions under 50 lines  
- [ ] No console.* in library code
- [ ] All error paths return meaningful errors
- [ ] Test coverage >70%
- [ ] No TODO/FIXME in production code
- [ ] All dependencies documented in tracking file
- [ ] Design decisions documented

**Example consolidation session**:

```bash
# Taking the auth prototype to production

# Refinements made:
- Extract AuthService class with proper error handling
- Add comprehensive test suite with factory functions
- Replace console.log with structured logging
- Document token expiration decisions
- Add input validation with clear error messages
- Update dependency tracking with security review
```

## The Critical Rule: Always End with Consolidation

**🚨 MANDATORY: Every exploration session MUST be followed by consolidation**

This is enforced by:

- **Lint failures** on unconsolidated code
- **Build failures** on incomplete consolidation
- **Pull request blocks** until consolidation checklist complete

### Why This Rule Exists

1. **Prevents Technical Debt Accumulation**: Without mandatory consolidation, exploration code becomes production code
2. **Maintains Code Quality**: Ensures AI-generated code meets production standards
3. **Preserves Human Context**: Forces documentation of decisions AI cannot understand
4. **Enables Future AI Assistance**: Well-consolidated code provides better context for future AI sessions

## Implementation with explicit-decisions Framework

### Tooling Support

The explicit-decisions framework enforces phase-based development through:

**ESLint Rules**:

- `no-console-in-library`: Prevents console logging in production code
- `no-large-files`: Warns when files exceed size limits
- `prefer-ts-imports`: Enforces explicit import decisions

**Dependency Management**:

- All dependency decisions must be explicitly documented
- 30-day review cycles prevent stale decisions
- Build fails on undocumented dependency changes

**Automated Checklist** (coming soon):

```bash
pnpm consolidation:check
# Validates all consolidation requirements are met
```

### Workflow Integration

```bash
# Start exploration
git checkout -b feature/user-auth
# ... rapid development with AI ...

# Before committing - consolidation check
pnpm lint                    # Enforces consolidation rules
pnpm test                    # Validates test coverage
pnpm deps:check             # Validates dependency decisions

# Only commit when consolidation complete
git commit -m "Add user authentication

Consolidation complete:
- AuthService extracted with proper error handling
- Test coverage: 85%
- All dependencies reviewed and documented
- Console logging replaced with structured logging"
```

## Working with AI Assistants

### Exploration Phase with AI

**Effective prompts**:

- "Let's prototype user authentication quickly"
- "Help me explore different approaches to file upload"
- "What's a fast way to add real-time notifications?"

**AI is great at**:

- Rapid prototyping
- Suggesting multiple approaches
- Generating boilerplate code
- Quick implementation patterns

### Consolidation Phase with AI

**Effective prompts**:

- "Let's consolidate this authentication code for production"
- "Help me extract proper abstractions from this prototype"
- "What error cases are we missing in this implementation?"

**AI helps with**:

- Identifying code smells
- Suggesting better abstractions
- Adding comprehensive error handling
- Writing test cases

**Human decisions required**:

- Architecture choices and trade-offs
- Error handling strategies
- Performance vs maintainability decisions
- Security considerations

## Benefits

### For Development Speed

- **Exploration phase** maximizes AI collaboration benefits
- **Rapid iteration** without quality constraints
- **Fast feedback loops** on functionality

### for Code Quality

- **Consolidation phase** ensures production standards
- **Explicit decision documentation** preserves human context
- **Automated enforcement** prevents quality drift

### For Team Collaboration

- **Clear phase indicators** help reviewers understand code maturity
- **Documented decisions** enable knowledge transfer
- **Consistent quality** across team members

## Common Anti-Patterns

### ❌ Exploration Without Consolidation

```bash
# Bad: Ship exploration code
git add . && git commit -m "Add auth feature"
# Result: Technical debt, unclear decisions, console.log in production
```

### ❌ Over-Engineering During Exploration

```bash
# Bad: Perfect abstractions during exploration
"Let's design the perfect authentication architecture first"
# Result: Analysis paralysis, slower iteration
```

### ❌ Skipping Decision Documentation

```bash
# Bad: Implicit dependency choices
npm install some-auth-library  # No decision documented
# Result: Unknown upgrade paths, unclear reasoning
```

## Success Patterns

### ✅ Clean Phase Separation

```bash
# Good: Clear phase boundaries
# Exploration: Get OAuth working (30 min)
# Consolidation: Extract AuthProvider, add tests, document security decisions (45 min)
```

### ✅ Explicit Decision Documentation

```bash
# Good: Document the "why" not just the "what"
"chose jsonwebtoken over jose library due to broader ecosystem support and team familiarity"
```

### ✅ Automated Enforcement

```bash
# Good: Let tooling enforce standards
pnpm lint    # Fails on console.log in src/
pnpm test    # Requires >70% coverage
pnpm deps:check  # Requires documented dependency decisions
```

## Measuring Success

**Exploration Phase Success**:

- Working functionality achieved in time-box
- Key decisions and trade-offs documented
- Clear path to consolidation identified

**Consolidation Phase Success**:

- All automated checks pass
- Code meets production quality standards
- Design decisions are explicitly documented
- Future maintainers can understand the code

**Overall Success**:

- Development velocity remains high
- Code quality standards are maintained
- Technical debt is prevented
- AI assistance effectiveness improves over time

---

*This methodology is enforced by the explicit-decisions framework ESLint rules, dependency management, and build tooling.*
