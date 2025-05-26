# Shared Lints Package Plan

## Overview

Create a shared ESLint configuration package to extract and consolidate linting logic from DoctorWhoScripts and mcpify repositories.

## Approach Analysis

Both repositories follow a consistent pattern:

- **pnpm workspaces** with monorepo structure
- **ESLint 9+ flat config** with strict TypeScript rules
- **Custom ESLint plugin** with domain-specific rules
- **No-mocks testing philosophy** enforced via custom rules
- **Strict TypeScript** using `@tsconfig/strictest`

## Implementation Steps

### 1. Initialize Repository Structure

- [ ] Create `package.json` with pnpm workspace configuration
- [ ] Create `pnpm-workspace.yaml` with separate locations for tools vs libraries
- [ ] Create root `tsconfig.json` extending `@tsconfig/strictest`
- [ ] Create `vitest.config.ts` for testing

### 2. Create Workspace Tool Packages (Development Infrastructure)

- [ ] Create `tools/eslint-config/` - Shared ESLint configurations
  - Extract common ESLint rules from both repositories
  - Create base configurations for:
    - TypeScript projects (strict)
    - Test files (lenient)
    - Package-specific overrides
  - Support import organization and TypeScript extensions
- [ ] Create `tools/eslint-plugin/` - Custom ESLint rules
  - Extract and consolidate custom rules:
    - `no-mocks-or-spies` rule (from both repos)
    - `require-ts-extensions` rule (TypeScript import enforcement)
    - Any other domain-agnostic custom rules
  - Include proper TypeScript definitions and testing
- [ ] Create `tools/tsconfig/` - Shared TypeScript configurations
- [ ] Create `tools/vitest-config/` - Shared Vitest configurations

### 3. Create Library Packages (If Needed)

- [ ] Create `packages/` directory for actual library code (if any future shared utilities)
- [ ] This separation allows tools (eslint configs, etc.) vs libraries (runtime code)

### 4. Documentation & Testing

- [ ] Create comprehensive README with usage examples
- [ ] Add examples showing how to consume in existing projects
- [ ] Create test suite for custom ESLint rules
- [ ] Document migration path from existing configurations

### 5. Integration Testing

- [ ] Test integration with DoctorWhoScripts project
- [ ] Test integration with mcpify project
- [ ] Verify no regressions in linting behavior
- [ ] Ensure all custom rules work as expected

## Key Decisions to Validate

1. **Package Structure**: Separate packages for config vs rules vs other tools?
2. **Naming Convention**: `@shared-lints/eslint-config`, `@shared-lints/eslint-plugin`, etc.?
3. **Versioning Strategy**: Independent package versions or unified versioning?
4. **Scope of Sharing**: Just ESLint or also TypeScript/Vitest configs?

## Expected Deliverables

1. **`@shared-lints/eslint-config`** - Shareable ESLint configurations
2. **`@shared-lints/eslint-plugin`** - Custom ESLint rules  
3. **Documentation** - Clear migration and usage guides
4. **Tests** - Comprehensive test suite for custom rules
5. **Examples** - Integration examples for consuming projects

## Success Criteria

- [ ] Both DoctorWhoScripts and mcpify can migrate to use shared packages
- [ ] No loss of linting functionality or strictness
- [ ] Simplified maintenance of ESLint configurations
- [ ] Clear path for other projects to adopt same standards
- [ ] Well-tested custom rules with proper TypeScript support
