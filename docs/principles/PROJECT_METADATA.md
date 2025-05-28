# Project Metadata Principle

## The Problem

When working with multiple package.json files across a monorepo, it's easy for project metadata to drift:
- Repository URLs might point to different locations
- Package scopes might be inconsistent  
- Homepage and issue URLs might be outdated

This is especially problematic when AI assistants try to help - they might see one pattern in one file and propagate it incorrectly to others.

## The Solution

We make project metadata decisions explicit through a `project-metadata.json` file that:

1. **Documents all metadata decisions** in one place
2. **Validates consistency** across all package.json files
3. **Requires review** of decisions periodically
4. **Fails builds** when metadata doesn't match

## Implementation

### project-metadata.json

```json
{
  "decisions": {
    "organizationName": {
      "value": "explicit-decisions",
      "reason": "GitHub organization name for this project",
      "decidedAt": "2024-11-28",
      "reviewBy": "2025-02-28"
    },
    "packageScope": {
      "value": "@explicit-decisions",
      "reason": "npm package scope for all published packages",
      "decidedAt": "2024-11-28",
      "reviewBy": "2025-02-28"
    }
  }
}
```

### Validation Script

The `check-project-metadata.js` script:
- Finds all package.json files
- Validates they match the decided values
- Checks if decisions need review
- Fails if inconsistencies are found

### Integration

Add to your lint process:
```json
{
  "scripts": {
    "lint": "... && node scripts/check-project-metadata.js"
  }
}
```

## Benefits

1. **No more accidental drift** - Metadata stays consistent
2. **Clear source of truth** - One file documents all decisions
3. **AI-friendly** - Assistants can read the decisions file
4. **Review reminders** - Decisions don't become stale

## When to Use This Pattern

Apply this pattern when you have:
- Multiple package.json files
- Published packages needing consistent metadata
- Team members who might use different values
- AI assistants helping with package management