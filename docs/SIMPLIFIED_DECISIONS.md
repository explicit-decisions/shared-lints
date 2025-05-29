# Simplified Decision Tracking

After review, we've drastically simplified the decision tracking system to focus on the essentials.

## Core Principle

Every decision has just four required fields:
- **value** - What was decided
- **reason** - Why this decision was made  
- **reviewBy** - When to review this decision
- **category.key** - Where it lives in the hierarchy

## Dependency Decisions

Dependencies are just regular decisions in the `dependencies` category:

```toml
[dependencies.typescript]
value = "^5.0.0"
reason = "Staying on v5 until we drop Node 16 support"
reviewBy = "2025-06-01"

[dependencies.lodash]
value = "deprecate"
reason = "Moving to native JS methods"
reviewBy = "2025-03-01"
```

That's it. No nested objects, no 15 optional fields.

## CLI Usage

### General Decisions
```bash
# Add any decision
decisions add <category> <key> <value> <reason>

# Examples
decisions add architecture database "PostgreSQL" "Better JSON support than MySQL"
decisions add patterns auth "JWT tokens" "Stateless authentication"

# List by category
decisions list              # all decisions
decisions list architecture # just architecture decisions
```

### Dependency Shortcuts
```bash
# Add a dependency decision (shortcut for common case)
decisions deps add typescript "^5.0.0" "Staying on v5 for compatibility"

# List dependencies
decisions deps list

# Check for expired dependency decisions
decisions deps check
```

## What We Removed

We removed all the complexity that wasn't being used:
- ❌ Nested policy objects
- ❌ Nested metadata objects
- ❌ 15 optional command flags
- ❌ Separate data structures for dependencies
- ❌ Auto-update policies (can be added later if needed)
- ❌ Security levels, tiers, peer constraints

## Benefits

1. **One pattern** - All decisions follow the same structure
2. **Simple commands** - No option soup
3. **Easy to understand** - Read the TOML file directly
4. **Focused** - Does one thing well: track decisions

## Future Extensions

If we need richer dependency metadata later, we can:
1. Add it as structured text in the reason field
2. Use a separate specialized tool
3. Add optional fields only when patterns emerge from actual use

The key insight: Start simple, add complexity only when proven necessary.