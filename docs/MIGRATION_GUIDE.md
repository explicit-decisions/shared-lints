# Migration Guide: JavaScript to TypeScript ESLint Rules

This guide provides a comprehensive roadmap for migrating from the JavaScript versions of explicit-decisions ESLint rules to the new TypeScript versions.

## Overview

The explicit-decisions ESLint plugin now offers both JavaScript and TypeScript versions of all rules. The TypeScript versions provide:

- **Full type safety** with proper AST node typing
- **Better IDE integration** with autocomplete and error detection
- **Professional development patterns** using @typescript-eslint/utils
- **Future-proof architecture** aligned with TypeScript ESLint ecosystem

## Quick Start

### For New Projects
Start directly with TypeScript rules:

```json
{
  "extends": ["@explicit-decisions"],
  "rules": {
    "@explicit-decisions/no-mocks-or-spies-ts": "error",
    "@explicit-decisions/no-any-in-tests-ts": "error",
    "@explicit-decisions/require-factory-functions-ts": "warn",
    "@explicit-decisions/prefer-real-implementations-ts": "warn",
    "@explicit-decisions/no-npx-usage-ts": "error",
    "@explicit-decisions/require-ts-extensions-ts": "error",
    "@explicit-decisions/prefer-ts-imports-ts": "warn"
  }
}
```

### For Existing Projects
Follow the step-by-step migration below.

## Step-by-Step Migration

### Phase 1: Preparation

#### 1. Update Dependencies
```bash
pnpm add -D @typescript-eslint/utils@^8.0.0
pnpm add -D typescript@^5.0.0
```

#### 2. Verify Current Configuration
Check your current explicit-decisions rules:

```bash
pnpm exec eslint --print-config src/index.ts | grep "@explicit-decisions"
```

#### 3. Backup Current Configuration
```bash
cp .eslintrc.json .eslintrc.json.backup
# or
cp eslint.config.js eslint.config.js.backup
```

### Phase 2: Side-by-Side Migration

Run both JavaScript and TypeScript versions simultaneously to compare behavior.

#### ESLint Config (eslint.config.js)
```javascript
import explicitDecisions from '@explicit-decisions/eslint-config';

export default [
  ...explicitDecisions,
  {
    rules: {
      // Keep existing JavaScript versions active
      '@explicit-decisions/no-mocks-or-spies': 'error',
      '@explicit-decisions/no-any-in-tests': 'error',
      
      // Add TypeScript versions as warnings initially
      '@explicit-decisions/no-mocks-or-spies-ts': 'warn',
      '@explicit-decisions/no-any-in-tests-ts': 'warn',
      '@explicit-decisions/require-factory-functions-ts': 'warn',
      '@explicit-decisions/prefer-real-implementations-ts': 'warn',
      '@explicit-decisions/no-npx-usage-ts': 'warn',
      '@explicit-decisions/require-ts-extensions-ts': 'warn',
      '@explicit-decisions/prefer-ts-imports-ts': 'warn',
    }
  }
];
```

#### Run Comparison Test
```bash
# See differences between JS and TS rule behavior
pnpm lint 2>&1 | grep "@explicit-decisions" | sort
```

### Phase 3: Rule-by-Rule Migration

Migrate one rule at a time to ensure stability.

#### 3.1 Start with Low-Risk Rules

**migrate: no-npx-usage**
```javascript
{
  rules: {
    // Disable JS version
    '@explicit-decisions/no-npx-usage': 'off',
    // Enable TS version
    '@explicit-decisions/no-npx-usage-ts': 'error',
  }
}
```

**Test the change:**
```bash
pnpm lint
pnpm test
```

**migrate: require-ts-extensions**
```javascript
{
  rules: {
    '@explicit-decisions/require-ts-extensions': 'off',
    '@explicit-decisions/require-ts-extensions-ts': 'error',
  }
}
```

**migrate: prefer-ts-imports**
```javascript
{
  rules: {
    '@explicit-decisions/prefer-ts-imports': 'off', 
    '@explicit-decisions/prefer-ts-imports-ts': 'warn',
  }
}
```

#### 3.2 Migrate Testing Rules

**migrate: no-mocks-or-spies**
```javascript
{
  rules: {
    '@explicit-decisions/no-mocks-or-spies': 'off',
    '@explicit-decisions/no-mocks-or-spies-ts': 'error',
  }
}
```

**migrate: require-factory-functions**
```javascript
{
  rules: {
    '@explicit-decisions/require-factory-functions': 'off',
    '@explicit-decisions/require-factory-functions-ts': 'warn',
  }
}
```

**migrate: no-any-in-tests**
```javascript
{
  rules: {
    '@explicit-decisions/no-any-in-tests': 'off',
    '@explicit-decisions/no-any-in-tests-ts': 'error',
  }
}
```

#### 3.3 Migrate Complex Rules

**migrate: prefer-real-implementations**
```javascript
{
  rules: {
    '@explicit-decisions/prefer-real-implementations': 'off',
    '@explicit-decisions/prefer-real-implementations-ts': ['warn', {
      allowedGlobals: ['console', 'process', 'global']
    }],
  }
}
```

### Phase 4: Validation and Cleanup

#### 4.1 Full Migration Test
```bash
# Run comprehensive tests
pnpm test
pnpm lint
pnpm typecheck

# Test edge cases
pnpm lint src/**/*.test.ts
pnpm lint src/**/*.spec.ts
```

#### 4.2 Remove JavaScript Rules
Final configuration with only TypeScript rules:

```javascript
export default [
  ...explicitDecisions,
  {
    rules: {
      // TypeScript-only configuration
      '@explicit-decisions/no-mocks-or-spies-ts': 'error',
      '@explicit-decisions/no-any-in-tests-ts': 'error', 
      '@explicit-decisions/require-factory-functions-ts': 'warn',
      '@explicit-decisions/prefer-real-implementations-ts': ['warn', {
        allowedGlobals: ['console', 'process']
      }],
      '@explicit-decisions/no-npx-usage-ts': 'error',
      '@explicit-decisions/require-ts-extensions-ts': 'error',
      '@explicit-decisions/prefer-ts-imports-ts': 'warn',
    }
  }
];
```

## Configuration Patterns

### Development vs Production

#### Development (Lenient)
```javascript
{
  rules: {
    '@explicit-decisions/no-mocks-or-spies-ts': 'warn',
    '@explicit-decisions/require-factory-functions-ts': 'warn',
    '@explicit-decisions/prefer-real-implementations-ts': 'warn',
    '@explicit-decisions/no-npx-usage-ts': 'error', // Always error
    '@explicit-decisions/require-ts-extensions-ts': 'error', // Always error
  }
}
```

#### Production (Strict)
```javascript
{
  rules: {
    '@explicit-decisions/no-mocks-or-spies-ts': 'error',
    '@explicit-decisions/no-any-in-tests-ts': 'error',
    '@explicit-decisions/require-factory-functions-ts': 'error',
    '@explicit-decisions/prefer-real-implementations-ts': 'error',
    '@explicit-decisions/no-npx-usage-ts': 'error',
    '@explicit-decisions/require-ts-extensions-ts': 'error',
    '@explicit-decisions/prefer-ts-imports-ts': 'error',
  }
}
```

### File-Specific Overrides

#### Test Files Only
```javascript
{
  files: ['**/*.test.ts', '**/*.spec.ts'],
  rules: {
    '@explicit-decisions/no-mocks-or-spies-ts': 'error',
    '@explicit-decisions/no-any-in-tests-ts': 'error',
    '@explicit-decisions/require-factory-functions-ts': 'warn',
  }
}
```

#### Source Files Only
```javascript
{
  files: ['src/**/*.ts'],
  excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
  rules: {
    '@explicit-decisions/prefer-real-implementations-ts': 'warn',
    '@explicit-decisions/require-ts-extensions-ts': 'error',
    '@explicit-decisions/prefer-ts-imports-ts': 'warn',
  }
}
```

#### Infrastructure Exclusions
```javascript
{
  files: ['scripts/**/*', 'tools/**/*'],
  rules: {
    // Relax rules for infrastructure code
    '@explicit-decisions/prefer-real-implementations-ts': 'off',
    '@explicit-decisions/no-any-in-tests-ts': 'off',
  }
}
```

## Common Migration Issues

### Issue 1: Type Annotation Conflicts

**Problem:**
```typescript
// TS rule flags missing type annotation
const testData = { name: 'test' }; // implicit any
```

**Solution:**
```typescript
// Add explicit interface
interface TestData {
  name: string;
}
const testData: TestData = { name: 'test' };
```

### Issue 2: Import Extension Conflicts

**Problem:**
```typescript
// Conflicting import styles
import { utils } from './utils'; // Missing extension
import { helper } from './helper.js'; // Wrong extension
```

**Solution:**
```typescript
// Consistent TypeScript imports
import { utils } from './utils.ts';
import { helper } from './helper.ts';
```

### Issue 3: Mock Migration Challenges

**Problem:**
```typescript
// Old mock pattern
const mockFn = jest.fn();
mockFn.mockReturnValue('test');
```

**Solution:**
```typescript
// Factory function pattern
interface TestService {
  getValue(): string;
}

class TestServiceImpl implements TestService {
  getValue() { return 'test'; }
}

const testService = new TestServiceImpl();
```

### Issue 4: Configuration Complexity

**Problem:**
Too many rules creating noise during migration.

**Solution:**
```javascript
// Gradual migration configuration
{
  rules: {
    // Start with errors only for critical rules
    '@explicit-decisions/no-npx-usage-ts': 'error',
    '@explicit-decisions/require-ts-extensions-ts': 'error',
    
    // Use warnings for guidance rules during migration
    '@explicit-decisions/prefer-real-implementations-ts': 'warn',
    '@explicit-decisions/require-factory-functions-ts': 'warn',
  }
}
```

## Validation Checklist

### Pre-Migration
- [ ] Current JavaScript rules working correctly
- [ ] All tests passing
- [ ] Dependencies updated
- [ ] Configuration backed up

### During Migration
- [ ] One rule migrated at a time
- [ ] Tests passing after each rule
- [ ] No regressions in functionality
- [ ] TypeScript compilation successful

### Post-Migration
- [ ] All TypeScript rules active
- [ ] JavaScript rules removed
- [ ] Full test suite passing
- [ ] Linting clean
- [ ] TypeScript compilation clean
- [ ] Documentation updated

## Rollback Plan

If issues arise during migration:

### 1. Quick Rollback
```bash
# Restore previous configuration
cp .eslintrc.json.backup .eslintrc.json
# or
cp eslint.config.js.backup eslint.config.js
```

### 2. Partial Rollback
```javascript
{
  rules: {
    // Disable problematic TS rule
    '@explicit-decisions/problematic-rule-ts': 'off',
    // Re-enable JS version
    '@explicit-decisions/problematic-rule': 'error',
  }
}
```

### 3. Rule-Specific Issues
```javascript
{
  rules: {
    // Temporarily reduce severity
    '@explicit-decisions/problematic-rule-ts': 'warn',
  }
}
```

## Success Metrics

Track these metrics to measure migration success:

### Code Quality
- [ ] Zero linting errors after migration
- [ ] TypeScript compilation without warnings
- [ ] All tests passing
- [ ] No regression in functionality

### Developer Experience  
- [ ] Better IDE integration (autocomplete, error detection)
- [ ] Clearer error messages from TypeScript rules
- [ ] Faster development feedback loop
- [ ] Reduced debugging time

### Explicit Decisions Philosophy
- [ ] More explicit type annotations in tests
- [ ] Consistent import patterns
- [ ] Real implementations replacing mocks
- [ ] Factory functions for test data

## Getting Help

### Common Resources
- [Rules Reference](./RULES_REFERENCE.md) - Detailed rule documentation
- [Philosophy Guide](../PHILOSOPHY.md) - Understanding the framework philosophy
- [Testing Philosophy](./TESTING_PHILOSOPHY.md) - No-mocks testing approach

### Troubleshooting
1. **Check TypeScript version compatibility** - Ensure TypeScript ^5.0.0
2. **Verify @typescript-eslint/utils version** - Should be ^8.0.0 or compatible
3. **Review configuration syntax** - Use flat config format for best results
4. **Test incrementally** - Migrate one rule at a time

### Migration Support
If you encounter issues during migration, the gradual approach with warnings allows you to identify and fix problems one rule at a time while maintaining development velocity.

The TypeScript rules provide a solid foundation for long-term maintainability and better integration with modern TypeScript development workflows.