# Decision Tracking System

## Overview

The shared-lints project uses a unified decision tracking system that captures all technical decisions in a single `decisions.toml` file. This includes dependency versions, architecture choices, tool selections, and process decisions.

## Design Principles

1. **Single Source of Truth** - All decisions in one TOML file
2. **Consistent Structure** - Every decision has: value, reason, and review date
3. **Category-based Organization** - Dependencies, architecture, tooling, patterns, process
4. **Review Enforcement** - Decisions expire and must be reviewed periodically
5. **Rich Metadata** - Optional fields for tier, alternatives, migration paths

## Data Structure

### Basic Decision
```toml
[category.key]
value = "chosen solution"
reason = "why this decision was made"
reviewBy = "YYYY-MM-DD"
```

### Dependency Decision (Enhanced)
```toml
[dependencies.typescript]
decision = "keep"              # keep, update, or deprecate
currentVersion = "^5.0.0"
availableVersion = "^5.3.0"    # optional
reason = "Essential for type safety"
tier = "essential"             # essential, justified, or deprecated
platformAlternative = "..."    # for essential tier
removalTrigger = "..."         # for justified tier
reviewBy = "2025-08-27"
```

## CLI Commands

### General Decisions
- `decisions init` - Create decisions.toml
- `decisions add <category> <key> <value> <reason>` - Add decision
- `decisions list` - List all decisions
- `decisions check` - Check for expired decisions (CI)
- `decisions review` - Interactive review of expired decisions

### Dependency Decisions
- `decisions deps add <name> [options]` - Add/update dependency decision
- `decisions deps list` - List all dependency decisions
- `decisions deps list --outdated` - Show outdated dependencies
- `decisions deps check` - Check dependency decisions (CI)
- `decisions deps interactive` - Interactive review (planned)

## Integration Points

### Package.json Scripts
```json
{
  "scripts": {
    "lint": "... && decisions deps check && ...",
    "lint:deps": "decisions deps check"
  }
}
```

### CI/CD Pipeline
```yaml
- name: Check decisions
  run: pnpm decisions check && pnpm decisions deps check
```

## Migration from Legacy Systems

The project previously used:
- `dependency-versions.json` for dependency tracking
- Separate scripts for dependency management

These have been unified into the decisions system while preserving all functionality.

## For Consumers vs Internal Use

### For Projects Using shared-lints
- Install: `@explicit-decisions/decisions`
- Track your own decisions in your `decisions.toml`
- Use the full CLI for managing decisions

### For shared-lints Development
- Internal scripts in `scripts/` manage shared-lints' own dependencies
- This "dogfooding" ensures we follow our own patterns

## Benefits

1. **Unified System** - One tool for all technical decisions
2. **Structured Data** - Consistent format makes tooling easier
3. **Forced Documentation** - Can't make decisions without explaining them
4. **Review Cycles** - Decisions don't become stale
5. **CI Integration** - Automated checks prevent drift
6. **Rich Context** - Tier system, alternatives, and migration paths provide full picture

## Future Enhancements

- Full interactive mode for dependency updates (like npm-check-updates)
- Integration with npm registry for automatic version checking
- Decision history tracking
- Team review workflows