# Shared Lints

Shared ESLint configurations and custom rules for TypeScript projects.

## Overview

This repository provides standardized ESLint configurations and custom rules that enforce consistent code quality and testing practices across projects.

## Packages

### `@shared-lints/eslint-config`

Shareable ESLint configurations with strict TypeScript rules, import organization, and project-specific overrides.

### `@shared-lints/eslint-plugin`

Custom ESLint rules that enforce:

- **No-mocks testing philosophy** - Prevents use of mocks/spies in tests
- **TypeScript import consistency** - Requires `.ts` extensions for local imports

## Quick Start

### Installation

```bash
pnpm add -D @shared-lints/eslint-config @shared-lints/eslint-plugin
```

### Basic Usage

Create `eslint.config.js`:

```javascript
import sharedConfig from "@shared-lints/eslint-config";
import customRules from "@shared-lints/eslint-plugin";

export default [
  // Apply shared configuration
  ...sharedConfig,
  
  // Add custom rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "shared-lints": customRules,
    },
    rules: {
      "shared-lints/no-mocks-or-spies": "error",
      "shared-lints/require-ts-extensions": "error",
    },
  },
];
```

### Required Dependencies

Your project needs these peer dependencies:

```bash
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-import-x
```

## Configuration Details

### TypeScript Rules

The shared config includes:

- **Strict TypeScript checking** - Based on `@typescript-eslint/strict` presets
- **Type safety enforcement** - No `any`, no unsafe operations
- **Consistent imports** - Type-only imports, consistent syntax
- **Code quality** - Explicit return types, readonly preferences

### Import Organization

Automatic import sorting with:

- Grouped imports (builtin, external, internal, relative)
- Alphabetical ordering within groups
- Newlines between groups
- TypeScript extension enforcement

### Test Configuration

More lenient rules for test files:

- Allows `any` types (with warnings)
- Relaxed unsafe operation rules
- Optional explicit return types

### Custom Rules

#### `no-mocks-or-spies`

Prevents use of mocking libraries in tests:

```typescript
// ❌ Forbidden
import { jest } from '@jest/globals';
const mockFn = jest.fn();
vi.mock('./module');

// ✅ Preferred
import { createTestUser } from './test-factories';
const user = createTestUser({ name: 'John' });
```

#### `require-ts-extensions`

Enforces `.ts` extensions for local TypeScript imports:

```typescript
// ❌ Missing extension
import { utils } from './utils';

// ✅ Explicit extension
import { utils } from './utils.ts';
```

## Migration Guide

### From existing ESLint configs

1. Replace existing ESLint config imports:

   ```diff
   - import typescript from "@typescript-eslint/eslint-plugin";
   - import prettier from "eslint-config-prettier";
   + import sharedConfig from "@shared-lints/eslint-config";
   ```

2. Simplify your config:

   ```diff
   export default [
   -   // Complex TypeScript rules setup
   -   {
   -     files: ["**/*.ts"],
   -     plugins: { "@typescript-eslint": typescript },
   -     rules: { /* many rules */ }
   -   },
   +   ...sharedConfig,
   ];
   ```

3. Enable custom rules:

   ```javascript
   import customRules from "@shared-lints/eslint-plugin";
   
   export default [
     ...sharedConfig,
     {
       plugins: { "shared-lints": customRules },
       rules: {
         "shared-lints/no-mocks-or-spies": "error",
         "shared-lints/require-ts-extensions": "error",
       },
     },
   ];
   ```

### Testing Philosophy

This configuration promotes a **no-mocks testing approach**:

- Use **factory functions** instead of mocks
- Test with **real implementations** when possible
- Use **dependency injection** for external dependencies
- Prefer **integration tests** over heavily mocked unit tests

Example factory function:

```typescript
export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
}
```

## Development

This repository uses pnpm workspaces:

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm typecheck
```

## Architecture

```
shared-lints/
├── tools/                  # Development infrastructure
│   ├── eslint-config/     # Shareable ESLint configurations
│   └── eslint-plugin/     # Custom ESLint rules
├── packages/              # Future library packages
└── package.json           # Workspace root
```

The `tools/` directory contains development infrastructure packages, while `packages/` is reserved for future runtime library code.
