# Example Usage

This document shows how to use `@explicit-decisions/tooling` in a real project.

## Installation

```bash
# In your project directory
npm install -D @explicit-decisions/tooling @explicit-decisions/eslint-config eslint
```

## Setup

```bash
# Interactive setup
npx shared-lints init
```

This will ask you questions and set up:
- ESLint configuration
- Dependency tracking
- Package.json scripts
- .gitignore updates

## Daily Workflow

### 1. Check dependency status
```bash
npm run deps:check
```

Example output:
```
❌ Dependency policy violations found:

1. Dependency react has updates available but is not tracked in dependency-versions.json
   💡 Run 'shared-lints deps interactive' to make decisions about updates

2. Dependency typescript decision is 45 days old (max: 30)
   💡 Run 'shared-lints deps interactive' to refresh your decision
```

### 2. Make dependency decisions
```bash
npm run deps:interactive
```

This runs `npm-check-updates` in interactive mode, then prompts you to document decisions for any packages you chose not to update.

### 3. Lint your code
```bash
npm run lint
```

This runs both dependency checking and ESLint. It will fail if:
- Dependencies need decisions
- ESLint rules are violated
- Dependency decisions are stale (>30 days)

## Example dependency-versions.json

After using the interactive mode, you'll get a file like:

```json
{
  "$schema": "./schemas/dependency-versions.schema.json",
  "lastUpdated": "2025-05-26",
  "dependencies": {
    "react": {
      "currentVersion": "^18.2.0",
      "latestAvailable": "^19.0.0",
      "reason": "REVIEWED: Waiting for ecosystem stability, some dependencies not compatible with React 19 yet",
      "reviewDate": "2025-05-26",
      "reviewer": "human",
      "status": "blocked"
    },
    "typescript": {
      "currentVersion": "^5.3.0",
      "latestAvailable": "^5.8.0",
      "reason": "Safe minor update, no breaking changes expected",
      "reviewDate": "2025-05-26", 
      "reviewer": "human",
      "status": "current"
    }
  },
  "rules": {
    "allowedOutdatedDays": 30,
    "requireReasonForOld": true,
    "blockMajorUpdatesWithoutReview": true
  }
}
```

## ESLint Configuration

The tooling creates an `eslint.config.js`:

```javascript
import explicitDecisions from '@explicit-decisions/eslint-config';

export default [
  ...explicitDecisions,
  
  // Project-specific overrides
  {
    rules: {
      // Add any project-specific rule overrides here
    }
  }
];
```

## Package.json Integration

Your package.json gets updated with scripts:

```json
{
  "scripts": {
    "lint": "shared-lints deps check && eslint .",
    "lint:fix": "eslint . --fix", 
    "deps:check": "shared-lints deps check",
    "deps:interactive": "shared-lints deps interactive",
    "deps:init": "shared-lints deps init"
  },
  "devDependencies": {
    "@explicit-decisions/eslint-config": "^1.0.0",
    "@explicit-decisions/tooling": "^1.0.0",
    "eslint": "^9.17.0"
  }
}
```

## CI/CD Integration

In your CI pipeline, run:

```bash
npm run lint
```

This will fail if:
1. Any dependencies are outdated without documented decisions
2. Any decisions are older than 30 days
3. Any ESLint rules are violated

This enforces the "Explicit Decisions" pattern - no implicit choices are allowed to slip through.

## Benefits

1. **No surprise dependency issues** - All updates are consciously decided
2. **Documented technical debt** - Reasons for keeping old versions are tracked
3. **Time-bounded decisions** - Reviews are required every 30 days
4. **CI/CD enforcement** - Builds fail without proper decisions
5. **LLM-friendly** - AI assistants can see and respect human decisions