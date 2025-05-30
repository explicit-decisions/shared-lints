# Decisions CLI

A command-line tool for tracking all technical decisions in TOML format, including dependencies, architecture choices, and process decisions.

## Purpose

This tool provides a unified way to track and review technical decisions with built-in support for:

- Dependency version decisions with rich metadata (tiers, alternatives, migration paths)
- Architecture decisions (build tools, frameworks, patterns)
- Process decisions (workflows, conventions)
- Tool choices (CI/CD, development tools)

## Installation

```bash
# In the workspace root
pnpm install
```

## Usage

### General Decisions

```bash
# Initialize a decisions.toml file
decisions init

# Add a decision
decisions add architecture monorepo "pnpm workspaces" "Native monorepo support"

# List all decisions
decisions list

# Check for expired decisions (for CI)
decisions check

# Review expired decisions interactively
decisions review
```

### Dependency Decisions

```bash
# Add a dependency decision with full metadata
decisions deps add typescript \
  --current "^5.0.0" \
  --decision keep \
  --reason "Essential for type safety" \
  --tier essential \
  --available "^5.3.0"

# List all dependency decisions
decisions deps list

# Show only outdated dependencies
decisions deps list --outdated

# Check dependency decisions (for CI)
decisions deps check

# Interactive dependency review (coming soon)
decisions deps interactive
```

## Decision Categories

- **architecture**: Major architectural decisions (monorepo, build tools, etc.)
- **tooling**: Non-npm tool choices (git hooks, CI/CD, etc.)
- **patterns**: Code patterns and conventions
- **process**: Development workflow decisions

## Example decisions.toml

```toml
[architecture.monorepo]
value = "pnpm workspaces"
reason = "Native monorepo support with strict dependency management"
reviewBy = "2026-01-01"

[patterns.imports]
value = "ESM with .js extensions"
reason = "Native Node.js ESM support without build step"
reviewBy = "2025-12-01"
```

## Integration with CI

Add to your CI pipeline to ensure decisions are reviewed:

```yaml
- name: Check decisions
  run: pnpm decisions check
```

## Why TOML?

TOML provides a human-readable format for configuration with clear structure,
making it easy to review and update decisions during code review.
