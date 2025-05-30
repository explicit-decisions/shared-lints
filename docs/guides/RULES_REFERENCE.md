# ESLint Rules Reference

This document provides comprehensive documentation for all shared-lints ESLint rules, including examples, rationale, and configuration options.

## Overview

The shared-lints ESLint plugin implements the **Enforced Explicit Decisions Pattern** through rules that create hard failures LLMs cannot ignore. Each rule embodies the core philosophy of this pattern: make implicit decisions explicit through tooling that enforces coordination between humans and AI assistants.

## Available Rules

### Testing Philosophy Rules

- [`no-mocks-or-spies`](#no-mocks-or-spies) - Disallow mocking libraries in tests
- [`require-factory-functions`](#require-factory-functions) - Encourage factory functions for test data
- [`no-any-in-tests`](#no-any-in-tests) - Prevent 'any' types in test files
- [`prefer-real-implementations`](#prefer-real-implementations) - Encourage dependency injection

### Code Quality Rules

- [`no-npx-usage`](#no-npx-usage) - Prevent arbitrary npx execution
- [`require-ts-extensions`](#require-ts-extensions) - Enforce explicit TypeScript imports
- [`prefer-ts-imports`](#prefer-ts-imports) - Prefer .ts over .js when available

---

## Testing Philosophy Rules

### `no-mocks-or-spies`

**Type:** Problem  
**Fixable:** Yes (code)  
**TypeScript Version:** `no-mocks-or-spies-ts`

Disallows the use of mocking libraries and spy functions in tests. Promotes the no-mocks testing philosophy where real implementations and dependency injection create more reliable tests.

#### Why This Rule Exists

Mocking frameworks encourage implicit assumptions about implementation details. They create false confidence - tests pass but code is broken. Real implementations force better architecture through dependency injection.

#### Examples

❌ **Incorrect:**

```typescript
// Mock usage
import { jest } from '@jest/globals';
import sinon from 'sinon';

test('user service', () => {
  const mockDatabase = jest.fn();
  const spy = sinon.spy(userService, 'save');
  // Tests become brittle and don't catch real integration issues
});
```

✅ **Correct:**

```typescript
// Real implementations with dependency injection
import { createTestDatabase } from './test-utils/database';
import { createTestUser } from './test-utils/factories';

test('user service', () => {
  const testDb = createTestDatabase();
  const userService = new UserService(testDb);
  const user = createTestUser({ name: 'John' });
  
  userService.save(user);
  expect(testDb.getUser(user.id)).toEqual(user);
});
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/no-mocks-or-spies": "error"
  }
}
```

#### Auto-fix Behavior

The rule will automatically remove:

- Mock function calls (`jest.fn()`, `sinon.stub()`)
- Spy declarations (`jest.spy()`, `sinon.spy()`)
- Import statements for mocking libraries

---

### `require-factory-functions`

**Type:** Suggestion  
**Fixable:** No (requires human judgment)  
**TypeScript Version:** `require-factory-functions-ts`

Encourages the use of factory functions for complex test data instead of inline object literals. Promotes reusable, maintainable test data creation.

#### Why This Rule Exists

Large inline objects in tests are hard to maintain and create duplication. Factory functions provide:

- Reusable test data patterns
- Clear defaults with customizable overrides
- Better maintainability when data structures change
- Self-documenting test intent

#### Examples

❌ **Triggers Warning:**

```typescript
test('user creation', () => {
  // Large inline object - hard to maintain
  const userData = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      zipCode: '12345'
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  };
});
```

✅ **Recommended:**

```typescript
// Create factory function in test-utils/
export function createTestUser(overrides = {}) {
  return {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      zipCode: '12345'
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    ...overrides
  };
}

test('user creation', () => {
  const user = createTestUser({ name: 'Custom Name' });
  // Clear intent, easy to customize
});
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/require-factory-functions": "warn"
  }
}
```

#### Triggering Conditions

- Objects with more than 5 properties
- Objects with nested object properties
- Arrays with more than 3 object elements

---

### `no-any-in-tests`

**Type:** Problem  
**Fixable:** No (requires explicit typing decisions)  
**TypeScript Version:** `no-any-in-tests-ts`

Prevents the use of 'any' types in test files. Ensures tests follow the same TypeScript strictness as production code.

#### Why This Rule Exists

Tests with 'any' types provide false confidence and can miss type-related bugs. Strict typing in tests:

- Catches type compatibility issues early
- Documents expected interfaces clearly
- Prevents regression when types change
- Maintains same quality standards as production code

#### Examples

❌ **Incorrect:**

```typescript
// Explicit any usage
const testData: any = { name: 'test' };

// Type assertions to any
const result = someFunction() as any;

// Implicit any through missing annotations
const mockResponse = { data: { users: [] } }; // Inferred as any
```

✅ **Correct:**

```typescript
// Explicit interface definition
interface TestUser {
  id: string;
  name: string;
  email: string;
}

const testUser: TestUser = {
  id: 'test-1',
  name: 'Test User',
  email: 'test@example.com'
};

// Proper type assertions
const result = someFunction() as UserResponse;

// Explicit typing for complex objects
const mockResponse: ApiResponse<User[]> = {
  data: { users: [] },
  status: 'success'
};
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/no-any-in-tests": "error"
  }
}
```

#### Detection Patterns

- Direct `any` type usage
- `as any` type assertions
- Variables with implicit any in test setup patterns
- Functions without return type annotations in test helpers

---

### `prefer-real-implementations`

**Type:** Suggestion  
**Fixable:** No (requires architectural decisions)  
**TypeScript Version:** `prefer-real-implementations-ts`

Encourages dependency injection and real implementations over hard-coded dependencies. Promotes testable architectures.

#### Why This Rule Exists

Hard-coded dependencies make testing difficult and force the use of mocks. Dependency injection enables:

- Easy testing with real implementations
- Better separation of concerns
- More flexible and maintainable code
- Clear documentation of dependencies

#### Examples

❌ **Problematic:**

```typescript
import fs from 'fs';
import crypto from 'crypto';

// Hard-coded dependencies
function saveUserData(user: User) {
  const id = crypto.randomUUID(); // Hard to test
  const data = JSON.stringify({ ...user, id });
  fs.writeFileSync(`users/${id}.json`, data); // Hard to test
  return id;
}
```

✅ **Recommended:**

```typescript
// Dependency injection
interface FileSystem {
  writeFileSync(path: string, data: string): void;
}

interface IdGenerator {
  generateId(): string;
}

function saveUserData(
  user: User, 
  fileSystem: FileSystem,
  idGenerator: IdGenerator
) {
  const id = idGenerator.generateId();
  const data = JSON.stringify({ ...user, id });
  fileSystem.writeFileSync(`users/${id}.json`, data);
  return id;
}

// Easy to test with real implementations
class TestFileSystem implements FileSystem {
  files = new Map<string, string>();
  
  writeFileSync(path: string, data: string) {
    this.files.set(path, data);
  }
}

class TestIdGenerator implements IdGenerator {
  generateId() {
    return 'test-id-123';
  }
}
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/prefer-real-implementations": "warn",
    "@explicit-decisions/prefer-real-implementations": ["warn", {
      "allowedGlobals": ["console", "process"]
    }]
  }
}
```

#### Options

- `allowedGlobals` (string[]): Global dependencies that are allowed without injection

#### Detection Patterns

- Imports of Node.js built-in modules
- Direct access to global objects (Math, Date, performance)
- Hard-coded API calls in functions

---

## Code Quality Rules

### `no-npx-usage`

**Type:** Problem  
**Fixable:** Yes (code)  
**TypeScript Version:** `no-npx-usage-ts`

Disallows `npx` or `pnpx` usage in favor of explicit `pnpm exec`. Enforces explicit package management and prevents arbitrary code execution.

#### Why This Rule Exists

NPX executes arbitrary code from the internet without explicit dependency management. Using `pnpm exec` ensures:

- All tools are declared in package.json
- Version control over tool versions
- Audit trail of tool usage
- Prevention of supply chain attacks

#### Examples

❌ **Incorrect:**

```typescript
// In scripts or code
execSync('npx typescript --init');
execSync('pnpx create-react-app my-app');

// In package.json scripts
{
  "scripts": {
    "format": "npx prettier --write ."
  }
}
```

✅ **Correct:**

```typescript
// Use pnpm exec instead
execSync('pnpm exec typescript --init');
execSync('pnpm exec create-react-app my-app');

// In package.json
{
  "devDependencies": {
    "prettier": "^3.0.0"
  },
  "scripts": {
    "format": "pnpm exec prettier --write ."
  }
}
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/no-npx-usage": "error"
  }
}
```

#### Auto-fix Behavior

Automatically converts:

- `npx command` → `pnpm exec command`
- `pnpx command` → `pnpm exec command`

---

### `require-ts-extensions`

**Type:** Problem  
**Fixable:** Yes (code)  
**TypeScript Version:** `require-ts-extensions-ts`

Requires `.ts` extensions when importing TypeScript files that exist on disk. Eliminates ambiguity about file types.

#### Why This Rule Exists

Explicit file extensions prevent ambiguity and ensure LLMs understand the import graph correctly:

- Clear intent about what's being imported
- Prevents confusion between .js and .ts files
- Makes module resolution explicit
- Helps with bundler configuration

#### Examples

❌ **Incorrect:**

```typescript
// Missing .ts extension when user.ts exists
import { User } from './models/user';
import { validateEmail } from '../utils/validation';
```

✅ **Correct:**

```typescript
// Explicit .ts extensions
import { User } from './models/user.ts';
import { validateEmail } from '../utils/validation.ts';
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/require-ts-extensions": "error"
  }
}
```

#### Auto-fix Behavior

Automatically adds `.ts` extensions when:

- Importing relative paths without extensions
- TypeScript file exists at the resolved path

---

### `prefer-ts-imports`

**Type:** Suggestion  
**Fixable:** Yes (code)  
**TypeScript Version:** `prefer-ts-imports-ts`

Prefers importing from `.ts` files when they exist instead of `.js` files. Ensures TypeScript sources are used when available.

#### Why This Rule Exists

Using TypeScript sources instead of compiled JavaScript provides:

- Better type information
- Source map accuracy
- Development-time error detection
- Consistency in import patterns

#### Examples

❌ **Suboptimal:**

```typescript
// Importing .js when .ts exists
import { helper } from './utils/helper.js';
import { config } from '../config/app.js';
```

✅ **Preferred:**

```typescript
// Import TypeScript sources directly
import { helper } from './utils/helper.ts';
import { config } from '../config/app.ts';
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/prefer-ts-imports": "warn"
  }
}
```

#### Auto-fix Behavior

Automatically converts `.js` imports to `.ts` when:

- TypeScript file exists at the resolved path
- Import is a relative path

### `no-inconsistent-patterns`

Detects when the same problem is solved in multiple different ways within a codebase, suggesting copy-paste or pattern-matching without understanding. This is a common LLM "vibe coding" pattern where different approaches are used inconsistently throughout the codebase.

#### Why This Rule Exists

LLMs often generate code by pattern-matching from their training data, which can lead to:

- Multiple async patterns in the same codebase (callbacks, promises, async/await)
- Inconsistent import styles (with/without extensions)  
- Duplicate utility functions with slightly different names
- Old polyfills when modern alternatives exist

This creates maintenance burden and confusion for developers.

#### Examples

❌ **Incorrect:**

```typescript
// File A: Using async/await
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// File B: Using promises in the same codebase
function fetchUser(id: string) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json());
}

// File C: Using callbacks (even worse)
function fetchUser(id: string, callback: (user: User) => void) {
  fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(callback);
}
```

✅ **Correct:**

```typescript
// Consistent async/await pattern across all files
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}
```

#### What It Detects

1. **Inconsistent async patterns** - mixing async/await, promises, and callbacks
2. **Inconsistent import extensions** - some files using .js extensions, others not
3. **Duplicate utility functions** - similar functions with slightly different names
4. **Outdated patterns** - using polyfills when modern alternatives exist

Example of outdated pattern detection:

```typescript
// ❌ Detects old __dirname polyfill
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

// ✅ Use modern alternative
const __dirname = import.meta.dirname;
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/no-inconsistent-patterns": "error"
  }
}
```

#### Auto-fix Behavior

This rule does not provide auto-fix because:

- Choosing the right pattern requires understanding the codebase context
- Automatic refactoring could break existing code
- The goal is to make developers aware of the inconsistency

---

## Migration Guide

### From JavaScript to TypeScript Rules

All rules are available in both JavaScript and TypeScript versions:

```json
{
  "rules": {
    // Original JavaScript versions
    "@explicit-decisions/no-mocks-or-spies": "error",
    
    // TypeScript versions (recommended)
    "@explicit-decisions/no-mocks-or-spies-ts": "error"
  }
}
```

### Gradual Migration Strategy

1. **Start with TypeScript rules** for new projects
2. **Run both versions** during migration period  
3. **Switch to TypeScript-only** once confident
4. **Remove JavaScript versions** for cleanup

### Configuration Examples

#### Strict Configuration

```json
{
  "rules": {
    "@explicit-decisions/no-mocks-or-spies-ts": "error",
    "@explicit-decisions/no-any-in-tests-ts": "error",
    "@explicit-decisions/require-factory-functions-ts": "error",
    "@explicit-decisions/prefer-real-implementations-ts": "error",
    "@explicit-decisions/no-npx-usage-ts": "error",
    "@explicit-decisions/require-ts-extensions-ts": "error",
    "@explicit-decisions/prefer-ts-imports-ts": "error"
  }
}
```

#### Gradual Adoption

```json
{
  "rules": {
    "@explicit-decisions/no-mocks-or-spies-ts": "warn",
    "@explicit-decisions/require-factory-functions-ts": "warn", 
    "@explicit-decisions/prefer-real-implementations-ts": "warn",
    "@explicit-decisions/no-npx-usage-ts": "error",
    "@explicit-decisions/require-ts-extensions-ts": "error"
  }
}
```

## Philosophy Integration

Each rule embodies the shared-lints philosophy:

1. **Hard Failures**: Rules create failures that LLMs cannot ignore
2. **Clear Guidance**: Error messages explain WHY and provide actionable HOW  
3. **Context Documentation**: Decisions are made explicit and documented
4. **Auto-fix When Possible**: Mechanical changes are automated
5. **Force Explicit Choice**: Where context matters, humans make the call

For more details, see [PHILOSOPHY.md](../PHILOSOPHY.md) and [TESTING_PHILOSOPHY.md](./TESTING_PHILOSOPHY.md).
