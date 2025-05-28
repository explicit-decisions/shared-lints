# Principles Documentation

This directory contains the fundamental principles and decision frameworks that guide the shared-lints project development.

## Core Principles

### [DEVELOPMENT_PRIORITIES.md](./DEVELOPMENT_PRIORITIES.md)

**Three-tier priority system** for all shared-lints improvements:

- ⚡ **High-Leverage:** <1 hour, high impact, zero breaking changes
- 🏗️ **Foundation:** 1-3 hours, enables future features, reduces technical debt  
- 🚀 **New Features:** 3+ hours, uncertain value, potential breaking changes

*Philosophy: "Make existing features noticeably better before adding new features"*

### [PACKAGE_SELECTION.md](./PACKAGE_SELECTION.md)

**Dependency decision framework** based on platform-first philosophy:

- **Tier 1:** Prefer platform features over dependencies
- **Tier 2:** Essential tooling only with explicit justification
- **Tier 3:** New packages require compelling rationale and review cycle

*Philosophy: "The best package is often the one you don't install"*

### [PROJECT_METADATA.md](./PROJECT_METADATA.md)

**Project metadata consistency** across all package.json files:

- **Single source of truth:** All metadata decisions in one file
- **Automated validation:** Fails builds on inconsistency
- **Review cycles:** Periodic review of metadata decisions

*Philosophy: "Make implicit metadata decisions explicit"*

## How These Principles Work Together

### Decision-Making Hierarchy

1. **Development priorities** determine when to work on dependency changes
2. **Package selection** determines which dependencies to add/remove/update
3. **Both frameworks** require explicit documentation and periodic review

### Cross-References

- High-leverage improvements often involve **removing** unnecessary dependencies
- Foundation work might require **carefully justified** new tooling dependencies
- New features must **clearly justify** any additional package requirements

### Review Schedule

- **Monthly:** Assess current priorities against both frameworks
- **Quarterly:** Review package decisions and development priority effectiveness  
- **Major releases:** Ensure both frameworks align with project evolution

## Implementation Guidelines

### For Contributors

1. **Check development priorities** before proposing changes
2. **Follow package selection criteria** for any dependency modifications
3. **Document decisions** using the templates provided in each principle
4. **Respect the review cycles** established in each framework

### For Maintainers

1. **Enforce priority discipline** - no new features until foundation is solid
2. **Guard dependency boundaries** - every addition must meet package selection criteria
3. **Maintain documentation** - keep decision records current and accessible
4. **Review regularly** - both frameworks evolve with project needs

## Related Documentation

### Core Project Philosophy

- [../../PHILOSOPHY.md](../../PHILOSOPHY.md) - Overall shared-lints pattern philosophy
- [../../LLM_INSTRUCTIONS.md](../../LLM_INSTRUCTIONS.md) - AI collaboration guidance
- [../../CLAUDE.md](../../CLAUDE.md) - Project-specific AI instructions

### Implementation Documentation

- [../guides/RULES_REFERENCE.md](../guides/RULES_REFERENCE.md) - Complete ESLint rule documentation
- [../MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - TypeScript migration approach
- [../guides/USAGE_EXAMPLES.md](../guides/USAGE_EXAMPLES.md) - Real-world usage patterns

### Development Approach

- [../PHASE_BASED_DEVELOPMENT.md](../PHASE_BASED_DEVELOPMENT.md) - Development workflow
- [../guides/TESTING_PHILOSOPHY.md](../guides/TESTING_PHILOSOPHY.md) - Testing approach and no-mocks philosophy
- [../TYPESCRIPT_ESLINT_BLOG_POST.md](../TYPESCRIPT_ESLINT_BLOG_POST.md) - Technical development insights

## Future Principles

As the project evolves, additional principle documents may be added:

- **CONFIGURATION_STANDARDS.md** - TypeScript/ESLint configuration philosophy
- **TESTING_STANDARDS.md** - Comprehensive testing approach beyond no-mocks
- **DOCUMENTATION_STANDARDS.md** - Documentation quality and maintenance guidelines
- **RELEASE_STRATEGY.md** - Version management and backwards compatibility approach

---

**Maintained by:** Yehuda  
**Last updated:** 2025-01-26  
**Review schedule:** Monthly for content, quarterly for structure
