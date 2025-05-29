# Internal Scripts

This directory contains maintenance scripts for the shared-lints project itself. These scripts are NOT part of the published packages and are not intended for consumers.

## Purpose

These scripts help maintain the shared-lints monorepo by:
- Managing our own dependencies
- Validating project consistency
- Updating reference repositories
- Running migrations during development

## Scripts Overview

### Dependency Management (Internal)
- `deps-init.js` - Initialize dependency tracking for shared-lints
- `deps-interactive.js` - Interactive dependency review for shared-lints' own dependencies
- `check-dependencies.js` - Validate our dependency decisions against tracking file

### Project Maintenance
- `check-project-metadata.js` - Ensure all package.json files have consistent metadata
- `llm-bootstrap.js` - Quick health check and orientation for AI assistants
- `migrate-dependencies-to-decisions.js` - One-time migration to unified decisions system

### Reference Repository Management
- `update-reference-repos.sh` - Pull latest changes from reference repositories
- `link-reference-repos.sh` - Create symlinks for local development
- `validate-reference-config.js` - Validate reference repository configuration

## For Consumers

If you're using shared-lints in your project, you want the tools in the `tools/` directory instead:

- **For ESLint rules**: `@explicit-decisions/eslint-plugin`
- **For ESLint config**: `@explicit-decisions/eslint-config`
- **For decision tracking**: `@explicit-decisions/decisions`
- **For project setup**: `@explicit-decisions/tooling`

## Development Workflow

When working on shared-lints itself:

```bash
# Check our own dependencies
pnpm deps:interactive

# Validate project structure
pnpm lint:metadata

# Update reference repos for testing
pnpm refs:sync
```

These scripts ensure shared-lints follows its own best practices ("dogfooding").