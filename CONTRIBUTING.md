# Contributing to shared-lints

Thank you for your interest in contributing! This project follows its own principles, so please read this guide before submitting changes.

## Before You Start

1. **Read the [Philosophy](./docs/PHILOSOPHY.md)** - Understand why this project exists
2. **Review [Development Workflow](./docs/DEVELOPMENT_WORKFLOW.md)** - Learn our two-phase process
3. **Check [Development Priorities](./docs/principles/DEVELOPMENT_PRIORITIES.md)** - See what types of changes we prioritize

## Development Setup

```bash
# Clone the repository
git clone https://github.com/yehudakatz/shared-lints.git
cd shared-lints

# Install dependencies (we use pnpm)
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Contribution Process

### 1. Check Existing Issues

Before starting work, check if there's an existing issue for your idea. If not, open one to discuss the change before implementing.

### 2. Follow the Two-Phase Workflow

All contributions must follow our two-phase development process:

#### Phase 1: Exploration

- Create a draft PR early
- Focus on getting something working
- Don't worry about perfect code quality
- Use `[Exploration]` prefix in PR title

#### Phase 2: Consolidation

- Update PR title to remove `[Exploration]` prefix
- Ensure all quality gates pass
- Add comprehensive tests
- Update documentation
- Follow all project standards

### 3. Quality Requirements

Your PR must:

- [ ] Pass all linting (`pnpm lint`)
- [ ] Pass all tests (`pnpm test`)
- [ ] Include tests for new functionality
- [ ] Update relevant documentation
- [ ] Follow TypeScript strict mode
- [ ] Use real implementations, not mocks
- [ ] Include explicit `.ts` extensions in imports

### 4. Commit Guidelines

We use conventional commits:

```
feat: add new ESLint rule for X
fix: correct auto-fix behavior in Y
docs: update rule reference for Z
test: add tests for edge case
chore: update dependencies
```

## Types of Contributions

### High Priority (⚡ High-Leverage)

- Bug fixes that affect many users
- Documentation improvements
- Performance optimizations
- Better error messages

### Medium Priority (🏗️ Foundation)

- New test cases
- Refactoring for maintainability
- Tool improvements
- Integration examples

### Lower Priority (🚀 New Features)

- New ESLint rules (must have strong justification)
- New configuration options
- Additional tooling

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer `#private` fields over `private` keyword
- Use type-only imports where applicable

### Testing

- Write tests using Vitest
- Use factory functions, not mocks
- Follow Arrange-Act-Assert pattern
- Test edge cases and error conditions

### Documentation

- Update docs for any user-facing changes
- Include code examples
- Explain the "why" not just the "what"
- Keep language clear and concise

## Working with AI

If you're using AI assistance:

1. Inform the AI about our no-mocks policy
2. Tell it we require `.ts` extensions
3. Mention we use pnpm, not npm or yarn
4. Reference our [AI Collaboration Guide](./docs/AI_COLLABORATION.md)

## Review Process

1. **Automated checks** run on all PRs
2. **Code review** focuses on:
   - Alignment with project philosophy
   - Test coverage and quality
   - Documentation completeness
   - Performance implications
3. **Feedback iterations** are normal - we aim for high quality

## Questions?

- Check existing documentation first
- Look for similar closed issues
- Ask in the issue before implementing
- Be patient - we're all volunteers

## Recognition

Contributors are recognized in:

- Release notes
- Project documentation
- GitHub contributors graph

Thank you for helping make AI-assisted development better for everyone! 🚀
