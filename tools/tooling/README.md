# @explicit-decisions/tooling

CLI tools for setting up and managing the **Enforced Explicit Decisions framework**.

## Installation

```bash
npm install -D @explicit-decisions/tooling @explicit-decisions/eslint-config
```

## Quick Start

Initialize shared-lints in your project:

```bash
npx shared-lints init
```

This will:

- Set up ESLint configuration with shared-lints rules
- Initialize dependency tracking
- Update your package.json scripts
- Configure .gitignore appropriately

## Commands

### Project Setup

```bash
shared-lints init
```

Interactive setup wizard that configures ESLint, dependency management, and project scripts.

### Dependency Management

```bash
# Initialize dependency tracking
shared-lints deps init

# Check current dependency decisions
shared-lints deps check

# Interactive dependency management
shared-lints deps interactive
```

## Dependency Management

The dependency management system implements the "Enforced Explicit Decision" pattern:

1. **All outdated dependencies must be tracked** with explicit decisions
2. **30-day review cycle** prevents decisions from becoming stale
3. **Major version updates require review** and documentation
4. **Lint integration** fails builds when decisions aren't documented

### Workflow

1. Run `shared-lints deps interactive` to review outdated packages
2. Make decisions about which packages to update
3. Document reasons for keeping older versions
4. The system tracks your decisions in `dependency-versions.json`
5. Lint checks enforce that all decisions are documented

## Integration

Add to your package.json scripts:

```json
{
  "scripts": {
    "lint": "shared-lints deps check && eslint .",
    "lint:fix": "eslint . --fix",
    "deps:check": "shared-lints deps check",
    "deps:interactive": "shared-lints deps interactive"
  }
}
```

## Files Created

- `dependency-versions.json` - Tracks dependency decisions
- `schemas/dependency-versions.schema.json` - JSON schema for validation
- `eslint.config.js` - ESLint configuration
- `.eslintignore` - ESLint ignore patterns

## Philosophy

This tooling implements the **"Enforced Explicit Decisions" pattern** for LLM-assisted development:

- **Hard failures** instead of warnings force attention to decisions
- **Documentation requirements** capture human context that LLMs miss
- **Time-based review cycles** prevent technical debt accumulation
- **JSON schema validation** ensures consistent decision tracking

## Examples

### Setting up a new project

```bash
cd my-project
npm install -D @explicit-decisions/tooling @explicit-decisions/eslint-config
npx shared-lints init
npm run lint
```

### Managing dependencies

```bash
# See what needs updating
npm run deps:check

# Make decisions about updates
npm run deps:interactive

# Verify all decisions are documented
npm run lint
```

## Configuration

The dependency tracking system can be configured in `dependency-versions.json`:

```json
{
  "rules": {
    "allowedOutdatedDays": 30,
    "requireReasonForOld": true,
    "blockMajorUpdatesWithoutReview": true
  }
}
```

## License

MIT
