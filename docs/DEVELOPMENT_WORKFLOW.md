# Development Workflow: Two-Phase Process

*Core component of the Enforced Explicit Decisions framework for AI-assisted development*

## Overview

This project follows a structured two-phase development approach that separates **exploration** (rapid prototyping) from **consolidation** (production-ready refinement). This methodology is a key part of the **Enforced Explicit Decisions pattern**, ensuring AI-assisted development produces maintainable, production-quality code while maximizing the speed benefits of AI collaboration.

## Core Philosophy

The **Enforced Explicit Decisions pattern** requires that all development follows two mandatory phases:

1. **Exploration Phase**: "Make it work" - Rapid prototyping and discovery
2. **Consolidation Phase**: "Make it right" - Systematic quality improvement

This approach prevents the common AI-assisted development pitfall of shipping prototype-quality code to production while ensuring decisions are explicit and enforceable.

## Phase 1: Exploration

### Purpose

- **Rapid prototyping** of solutions and ideas
- **Experimental implementation** without concern for polish
- **Discovery of requirements** and edge cases through building
- **Validation of approaches** before investing in quality

### Characteristics

- **Speed over quality**: Move fast, don't worry about perfect code
- **AI-assisted rapid development**: Leverage AI for quick iteration
- **Throw-away mentality**: Expect to rewrite or significantly refactor
- **Documentation optional**: Focus on learning and discovery

### AI Collaboration Guidelines

When working with AI assistants during exploration:

```
Context: I'm in exploration phase, prioritizing speed and discovery.
Goal: [Specific problem to solve]
Constraints: [Any hard requirements]
Request: Generate multiple approaches, don't worry about perfect code.
```

**Best practices**:

- Use AI freely for rapid code generation and iteration
- Ask open-ended questions: "What are different ways to implement X?"
- Generate multiple approaches and compare alternatives quickly
- Don't worry about best practices - focus on working solutions
- Leverage AI's pattern knowledge for similar problems

### Allowed During Exploration

- Quick and dirty implementations
- Temporary workarounds
- Inline TODO comments
- Console logging for debugging
- Any approach that gets to working functionality
- Skipping tests temporarily
- Hardcoded values for proof of concept

### Output Criteria

- **Working proof of concept** that demonstrates core functionality
- **Understanding of requirements** and technical constraints
- **Identified edge cases** and potential problems
- **Rough implementation** that can be improved in consolidation

### Time Limits

- **Individual features**: 1-3 hours maximum for exploration
- **Complex problems**: Break down into smaller explorable pieces
- **If stuck**: Switch to consolidation of what works, iterate

### Example Exploration Session

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

## Phase 2: Consolidation

### Purpose

- **Production-ready implementation** based on exploration learnings
- **Systematic quality improvement** following project standards
- **Comprehensive documentation** of decisions and rationale
- **Integration with existing codebase** and patterns

### Characteristics

- **Quality over speed**: Take time to do things right
- **Standards compliance**: Follow all project principles and patterns
- **Comprehensive testing**: Full test coverage with meaningful tests
- **Professional documentation**: Clear, maintainable, reviewable code

### AI Collaboration Guidelines

When working with AI assistants during consolidation:

```
Context: I'm in consolidation phase, following explicit-decisions project standards.
Standards: See docs/principles/ for development priorities and package selection.
Quality requirements: TypeScript strict mode, comprehensive tests, full documentation.
Request: [Specific improvement or implementation task]
```

**Best practices**:

- Provide explicit context referencing project principles and standards
- Request specific improvements: "Make this follow our TypeScript patterns"
- Validate against frameworks and check alignment with development priorities
- Document decisions and create clear rationale for implementation choices
- Review for maintainability - ensure code can be understood and modified

### Mandatory Requirements

1. **Follows development priorities framework**: Properly categorized and justified
2. **Meets package selection criteria**: Any new dependencies explicitly justified
3. **Comprehensive testing**: All functionality covered with meaningful tests
4. **Documentation updated**: README, principle docs, examples as needed
5. **Type safety**: Full TypeScript compliance with strict configuration
6. **Code quality**: Passes all linting, follows project conventions

### Quality Gates Checklist

- [ ] **Linting passes**: No ESLint errors or warnings
- [ ] **Tests comprehensive**: All functionality tested, coverage maintained
- [ ] **Documentation complete**: Usage examples, API docs, decision rationale
- [ ] **Type safety**: No TypeScript errors, proper typing throughout
- [ ] **Integration tested**: Works with existing functionality
- [ ] **Performance acceptable**: No significant regressions
- [ ] **Backwards compatible**: Unless explicitly planned breaking change
- [ ] **Dependency decisions documented**: All new packages justified
- [ ] **Error handling**: Proper error boundaries and user feedback
- [ ] **Accessibility**: UI components meet accessibility standards

### Consolidation Patterns

#### From Exploration to Production

```typescript
// Exploration phase - quick and dirty
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (token === 'secret123') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// Consolidation phase - production ready
import type { Request, Response, NextFunction } from 'express';
import { verifyJWT } from './auth/jwt.js';
import { AuthError } from './errors/auth-error.js';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = await verifyJWT(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
    } else {
      next(error);
    }
  }
}
```

## Workflow Integration

### With Development Priorities

- **⚡ High-leverage improvements**: May skip exploration if scope is clear
- **🏗️ Foundation work**: Usually requires exploration to understand requirements
- **🚀 New features**: Always require both phases for proper validation

### With Package Selection

- **Exploration phase**: Can use any packages to test approaches
- **Consolidation phase**: Must follow package selection criteria strictly
- **Dependency decisions**: Document rationale using package selection framework

### With Testing Philosophy

- **Exploration phase**: Can skip tests or use minimal testing
- **Consolidation phase**: Must follow no-mocks philosophy with comprehensive tests
- **Test patterns**: Use factory functions and real implementations

## Common Pitfalls to Avoid

### In Exploration

- **Over-engineering**: Don't build perfect architecture during exploration
- **Premature optimization**: Focus on functionality, not performance
- **Analysis paralysis**: Time-box and move to consolidation

### In Consolidation

- **Shipping prototypes**: Don't skip consolidation for "quick wins"
- **Ignoring standards**: Follow all project principles even if it takes longer
- **Incomplete testing**: Comprehensive tests are mandatory, not optional

## Phase Transition Checklist

Before moving from exploration to consolidation:

- [ ] **Working proof of concept validated**: Core functionality demonstrated
- [ ] **Requirements clear**: Understand scope and constraints
- [ ] **Approach decided**: Clear implementation strategy chosen
- [ ] **Edge cases identified**: Know what needs to be handled
- [ ] **Integration points mapped**: Understand how it fits with existing code
- [ ] **Ready for quality**: Prepared to invest in production-ready implementation

## Success Metrics

### Process Adoption

- **All significant changes** follow two-phase process
- **Clear phase documentation** in commit messages and pull requests
- **Quality gates passed** consistently in consolidation phase
- **Development velocity** maintained or improved

### Quality Outcomes

- **Fewer bugs** from systematic consolidation process
- **Better maintainability** from thoughtful implementation
- **Improved documentation** from mandatory consolidation requirements
- **Consistent patterns** across codebase

### AI Collaboration Effectiveness

- **More appropriate suggestions** from explicit context setting
- **Better code quality** from consolidation phase guidance
- **Faster iteration** in exploration phase
- **Clearer decision rationale** throughout process

## Review and Evolution

### Monthly Review Questions

1. **Is the two-phase process being followed?** Check recent commits and PRs
2. **Are quality gates effective?** Assess bug rates and maintenance burden
3. **Is AI collaboration improving?** Gather feedback on suggestion quality
4. **Do phases need adjustment?** Based on actual development patterns

### Adaptation Triggers

- **Consistent quality gate failures**: May need stricter exploration constraints
- **Slow consolidation**: May need better exploration → consolidation transition
- **AI collaboration issues**: May need better context templates
- **Team feedback**: Adjust based on developer experience

---

**Next Review Date**: 2025-02-26  
**Responsible**: Yehuda  
**Review Triggers**: Quality issues, team feedback, AI collaboration changes
