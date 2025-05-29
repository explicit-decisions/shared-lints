# Decisions CLI

A command-line tool for tracking non-dependency technical decisions in TOML format.

## Purpose

This tool tracks architectural, tooling, and process decisions that aren't npm dependencies.
For dependency decisions, use `pnpm deps:interactive` instead.

## Installation

```bash
# In the workspace root
pnpm install
```

## Usage

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