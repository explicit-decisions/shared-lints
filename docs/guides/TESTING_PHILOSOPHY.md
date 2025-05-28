# Testing Philosophy: Why No-Mocks Works Better with AI

*Implementing the Enforced Explicit Decisions Pattern for Testing*

## The Problem with Traditional Mocking

When AI assistants encounter mocked tests, they learn the wrong patterns. The **Enforced Explicit Decisions pattern** addresses this by making our testing philosophy explicit and enforceable through ESLint rules:

```typescript
// ❌ What AI learns from mocked tests:
const mockUser = jest.fn().mockReturnValue({ id: 1, name: 'Test' });
const mockDatabase = { save: jest.fn().mockResolvedValue(true) };

// AI assumes: "Testing means mocking external dependencies"
// Reality: This test tells us nothing about real integration
```

**Issues with mocks in AI-assisted development:**

1. **False patterns** - AI cargo-cults mocking without understanding when it's appropriate
2. **Brittle tests** - Mocks break when implementation details change, confusing AI about what's actually broken
3. **Poor design feedback** - Hard-to-test code gets mocked instead of refactored
4. **Context loss** - AI can't distinguish between "mock because external" vs "mock because lazy"

## The No-Mocks Alternative

Instead of mocking, we use **real implementations** and **factory functions**:

```typescript
// ✅ What AI learns from real implementations:
import { createTestUser, TestDatabase } from './test-utils/factories';

test('user service saves users correctly', async () => {
  const database = new TestDatabase();
  const userService = new UserService(database);
  
  const userData = createTestUser({ name: 'John Doe' });
  await userService.createUser(userData);
  
  expect(database.users).toHaveLength(1);
  expect(database.users[0].name).toBe('John Doe');
});
```

**What AI learns from this pattern:**

1. **Dependency injection** - Services take dependencies as parameters
2. **Factory functions** - Test data is created with explicit, reusable functions
3. **Real behavior** - Tests validate actual integration between components
4. **Clear intent** - Test setup makes domain concepts explicit

## Implementation Strategy

### 1. ESLint Rules for Enforcement

**Note: Testing rules provide guidance only - no auto-fixes.**

Testing patterns require human judgment and architectural decisions. Auto-fixing test structure could break working tests or introduce poor design patterns.

```typescript
// Caught by @explicit-decisions/no-mocks-or-spies  
const mockFn = jest.fn(); // ❌ ESLint error - guidance to use real implementations

// Caught by @explicit-decisions/require-factory-functions  
const user = { id: 1, name: 'Test', email: 'test@example.com', /* 20 more properties */ }; // ❌ Suggests factory

// Caught by @explicit-decisions/no-any-in-tests
const testData: any = createComplexObject(); // ❌ Requires proper typing

// Caught by @explicit-decisions/prefer-real-implementations
import fs from 'fs'; // In production code: ❌ Suggests dependency injection
```

**Why no auto-fixes for testing rules:**

- Factory function extraction requires understanding domain concepts
- Dependency injection requires architectural decisions
- Test structure changes could break working tests
- TypeScript typing requires understanding the actual data shapes

### 2. Automatic Test Utils Generation

When you run `explicit-decisions init --testing vitest`, you get:

**Factory Functions:**

```typescript
// src/test-utils/factories.ts - Auto-generated
export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
```

**Real Test Implementations:**

```typescript
// src/test-utils/implementations.ts - Auto-generated
export class TestDatabase implements Database {
  public users: User[] = [];
  
  async save(user: User): Promise<void> {
    this.users.push(user);
  }
  
  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }
  
  clear(): void {
    this.users = [];
  }
}
```

### 3. Strict Coverage Thresholds

```typescript
// vitest.config.ts - Auto-generated
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 70,    // Forces comprehensive test scenarios
          functions: 70,   // Ensures all code paths are tested
          lines: 70,       // Catches untested code
          statements: 70,
        },
      },
    },
  },
});
```

High coverage thresholds with real implementations ensure that:

- Integration issues are caught
- Edge cases are tested with real behavior
- Refactoring is safer (tests catch real breakage)

## Benefits for AI-Assisted Development

### 1. Better Pattern Learning

**With mocks:**

```typescript
// AI learns: "To test async functions, mock the dependencies"
const mockApi = jest.fn().mockResolvedValue({ data: 'test' });
```

**With real implementations:**

```typescript
// AI learns: "To test async functions, use dependency injection and real test implementations"
const testApi = new TestApiClient();
const service = new DataService(testApi);
```

### 2. Safer Refactoring

**Mocked tests:**

- Break when implementation changes (even if behavior is correct)
- Pass when implementation is wrong (if mocks don't match reality)
- Require updating mocks alongside implementation

**Real implementation tests:**

- Only break when actual behavior changes
- Catch real integration issues
- Encourage better architecture through dependency injection

### 3. Clear Intent Communication

```typescript
// ❌ Unclear what this test is validating
const mockEmailService = { send: jest.fn().mockResolvedValue(true) };

// ✅ Clear what behavior is being tested
const emailService = new TestEmailService();
// ... test actual email validation, formatting, etc.
expect(emailService.sentEmails).toHaveLength(1);
expect(emailService.sentEmails[0].subject).toContain('Welcome');
```

## Migration Strategy

### For Existing Codebases

1. **Start with new tests** - Use factory functions and real implementations for new features
2. **Identify high-value test conversions** - Focus on tests that break frequently or provide little confidence
3. **Extract interfaces** - Make dependencies injectable
4. **Create test implementations** - Build real test versions of external dependencies
5. **Convert gradually** - Replace mocks with real implementations one test at a time

### For AI Code Reviews

When AI suggests mocked tests, guide it toward:

```typescript
// Instead of: "Mock the database for this test"
// Suggest: "Let's create a TestDatabase implementation that we can inspect"

// Instead of: "Mock this API call"  
// Suggest: "Let's inject the API client and create a test implementation"
```

## Common Objections and Responses

### "Real implementations are slower"

**Response:** Test implementations are often faster than mocks because:

- No network calls (in-memory implementations)
- No complex mock setup/teardown
- Parallel test execution with isolated state

### "External dependencies are hard to test"

**Response:** External dependencies indicate design issues:

- Extract interfaces for external services
- Create lightweight test implementations
- Use dependency injection to make testing easier

### "Mocks test in isolation"

**Response:** Isolation is often the wrong goal:

- Integration bugs are more common than unit bugs
- Real implementations test the actual contracts
- Better architecture emerges from making code testable with real dependencies

## Conclusion

The no-mocks approach creates a positive feedback loop:

1. **Tests provide real confidence** in system behavior
2. **AI learns better patterns** from realistic test examples  
3. **Code architecture improves** through dependency injection
4. **Refactoring becomes safer** with integration-level test coverage

This aligns with the explicit-decisions philosophy: make human context (what we're actually testing) explicit enough for AI to understand and work with effectively.
