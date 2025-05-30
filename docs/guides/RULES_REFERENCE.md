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

### Pattern Consistency Rules

- [`no-mixed-async-patterns`](#no-mixed-async-patterns) - Enforce consistent async patterns
- [`no-inconsistent-import-extensions`](#no-inconsistent-import-extensions) - Enforce consistent import extensions
- [`no-duplicate-utilities`](#no-duplicate-utilities) - Detect duplicate utility functions
- [`no-outdated-polyfills`](#no-outdated-polyfills) - Detect outdated polyfill usage

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

## Pattern Consistency Rules

These rules detect when the same problem is solved in multiple different ways within a codebase, suggesting copy-paste or pattern-matching without understanding. This is a common LLM "vibe coding" pattern.

### `no-mixed-async-patterns`

**Type:** Suggestion  
**Fixable:** No  
**TypeScript Version:** `no-mixed-async-patterns`

Detects when different async patterns (callbacks, promises, async/await) are mixed within the same file.

#### Why This Rule Exists

Mixing async patterns in the same file suggests code copied from different sources without understanding. Consistent async patterns improve:

- Code readability and maintainability
- Error handling consistency
- Developer understanding
- Debugging experience

#### Examples

❌ **Incorrect:**

```typescript
// Mixing async/await and promises in same file
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

function updateUser(id: string, data: any) {
  return fetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    .then(response => response.json());
}

function deleteUser(id: string, callback: (success: boolean) => void) {
  fetch(`/api/users/${id}`, { method: 'DELETE' })
    .then(() => callback(true))
    .catch(() => callback(false));
}
```

✅ **Correct:**

```typescript
// Consistent async/await pattern
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

async function updateUser(id: string, data: any) {
  const response = await fetch(`/api/users/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  });
  return response.json();
}

async function deleteUser(id: string): Promise<boolean> {
  try {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    return true;
  } catch {
    return false;
  }
}
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/no-mixed-async-patterns": "error"
  }
}
```

---

### `no-inconsistent-import-extensions`

**Type:** Suggestion  
**Fixable:** No  
**TypeScript Version:** `no-inconsistent-import-extensions`

Enforces consistent use of file extensions in import statements within a file.

#### Why This Rule Exists

Inconsistent import extensions suggest code copied from different sources. Consistency ensures:

- Clear module resolution strategy
- Predictable bundler behavior
- Easier refactoring
- Better tool support

#### Examples

❌ **Incorrect:**

```typescript
// Inconsistent - some imports have extensions, others don't
import { User } from './models/user';
import { validateEmail } from './utils/validation.ts';
import { config } from '../config/app';
import { logger } from '../services/logger.ts';
```

✅ **Correct:**

```typescript
// Consistent - all imports use extensions
import { User } from './models/user.ts';
import { validateEmail } from './utils/validation.ts';
import { config } from '../config/app.ts';
import { logger } from '../services/logger.ts';

// OR consistent - no extensions
import { User } from './models/user';
import { validateEmail } from './utils/validation';
import { config } from '../config/app';
import { logger } from '../services/logger';
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/no-inconsistent-import-extensions": "error"
  }
}
```

---

### `no-duplicate-utilities`

**Type:** Suggestion  
**Fixable:** No  
**TypeScript Version:** `no-duplicate-utilities`

Detects functions with similar signatures and names that likely duplicate functionality.

#### Why This Rule Exists

Duplicate utilities suggest copy-paste programming without consolidation. This leads to:

- Maintenance burden (fixing bugs in multiple places)
- Inconsistent behavior
- Larger bundle sizes
- Confusion about which utility to use

#### Examples

❌ **Incorrect:**

```typescript
// Similar functions with slightly different names
function validateUserEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCompanyEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatUserDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatOrderDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

✅ **Correct:**

```typescript
// Single utility function
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Use the same function for different contexts
const isValidUserEmail = validateEmail(userEmail);
const isValidCompanyEmail = validateEmail(companyEmail);
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/no-duplicate-utilities": "warn"
  }
}
```

---

### `no-outdated-polyfills`

**Type:** Suggestion  
**Fixable:** No  
**TypeScript Version:** `no-outdated-polyfills`

Detects usage of polyfills or workarounds for features that are now natively supported.

#### Why This Rule Exists

Using outdated polyfills suggests code copied from older sources without understanding modern alternatives. This leads to:

- Unnecessary code complexity
- Worse performance
- Larger bundle sizes
- Missing out on native optimizations

#### Examples

❌ **Incorrect:**

```typescript
// Old __dirname polyfill
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Old JSON import pattern
import { readFileSync } from 'fs';
import { join } from 'path';
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

// Array.prototype.slice.call pattern
function toArray(arrayLike) {
  return Array.prototype.slice.call(arrayLike);
}

// Promise.resolve().then() pattern
Promise.resolve().then(() => {
  console.log('Next tick');
});
```

✅ **Correct:**

```typescript
// Modern import.meta.dirname
const __dirname = import.meta.dirname;

// Modern JSON imports
import packageJson from './package.json' with { type: 'json' };

// Modern array conversion
function toArray(arrayLike) {
  return Array.from(arrayLike);
  // or [...arrayLike]
}

// Modern async/await
async function nextTick() {
  await Promise.resolve();
  console.log('Next tick');
}
```

#### Configuration

```json
{
  "rules": {
    "@explicit-decisions/no-outdated-polyfills": "warn"
  }
}
```

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
