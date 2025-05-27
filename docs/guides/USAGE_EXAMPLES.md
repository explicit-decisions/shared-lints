# Usage Examples and Patterns

This document provides comprehensive examples of the explicit-decisions framework in action, demonstrating how the ESLint rules enforce better coding patterns and architectural decisions.

## Table of Contents

1. [No-Mocks Testing Patterns](#no-mocks-testing-patterns)
2. [Factory Function Examples](#factory-function-examples)
3. [Dependency Injection Patterns](#dependency-injection-patterns)
4. [TypeScript Strictness in Tests](#typescript-strictness-in-tests)
5. [Explicit Import Patterns](#explicit-import-patterns)
6. [Real-World Migration Examples](#real-world-migration-examples)

---

## No-Mocks Testing Patterns

### Before: Traditional Mock-Heavy Testing

```typescript
// ❌ Mock-heavy approach - brittle and unreliable
import { jest } from '@jest/globals';
import { UserService } from '../src/services/UserService';
import { DatabaseService } from '../src/services/DatabaseService';
import { EmailService } from '../src/services/EmailService';

describe('UserService', () => {
  let userService: UserService;
  let mockDb: jest.Mocked<DatabaseService>;
  let mockEmail: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockDb = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<DatabaseService>;
    
    mockEmail = {
      sendWelcomeEmail: jest.fn(),
      sendNotification: jest.fn(),
    } as jest.Mocked<EmailService>;
    
    userService = new UserService(mockDb, mockEmail);
  });

  test('creates user successfully', async () => {
    // Fragile mock setup
    mockDb.save.mockResolvedValue({ id: '123', name: 'John' });
    mockEmail.sendWelcomeEmail.mockResolvedValue(true);
    
    const result = await userService.createUser({ name: 'John', email: 'john@example.com' });
    
    // Tests implementation details, not behavior
    expect(mockDb.save).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
      createdAt: expect.any(Date)
    });
    expect(mockEmail.sendWelcomeEmail).toHaveBeenCalledWith('john@example.com');
  });
});
```

### After: Real Implementation Testing

```typescript
// ✅ Real implementation approach - robust and reliable
import { UserService } from '../src/services/UserService';
import { createTestDatabase } from './test-utils/database';
import { createTestEmailService } from './test-utils/email';
import { createTestUser } from './test-utils/factories';

describe('UserService', () => {
  let userService: UserService;
  let testDb: TestDatabase;
  let testEmail: TestEmailService;

  beforeEach(() => {
    testDb = createTestDatabase();
    testEmail = createTestEmailService();
    userService = new UserService(testDb, testEmail);
  });

  test('creates user successfully', async () => {
    const userData = createTestUser({ 
      name: 'John', 
      email: 'john@example.com' 
    });
    
    const result = await userService.createUser(userData);
    
    // Test actual behavior and state changes
    expect(result).toMatchObject({
      id: expect.any(String),
      name: 'John',
      email: 'john@example.com',
      createdAt: expect.any(Date)
    });
    
    // Verify real state changes
    const savedUser = await testDb.findById(result.id);
    expect(savedUser).toEqual(result);
    
    // Verify real email was queued
    const sentEmails = testEmail.getSentEmails();
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0]).toMatchObject({
      to: 'john@example.com',
      type: 'welcome'
    });
  });

  test('handles database errors gracefully', async () => {
    // Real error simulation
    testDb.simulateError('CONNECTION_FAILED');
    
    const userData = createTestUser();
    
    await expect(userService.createUser(userData)).rejects.toThrow('Database connection failed');
    
    // Verify no side effects occurred
    expect(testEmail.getSentEmails()).toHaveLength(0);
  });
});
```

### Supporting Test Infrastructure

```typescript
// test-utils/database.ts
export interface TestDatabase {
  save<T>(entity: T): Promise<T & { id: string }>;
  findById(id: string): Promise<any | null>;
  delete(id: string): Promise<boolean>;
  simulateError(type: string): void;
  clear(): void;
}

export function createTestDatabase(): TestDatabase {
  const data = new Map<string, any>();
  let shouldError: string | null = null;
  
  return {
    async save<T>(entity: T): Promise<T & { id: string }> {
      if (shouldError) {
        const error = shouldError;
        shouldError = null;
        throw new Error(`Database ${error.toLowerCase().replace('_', ' ')}`);
      }
      
      const id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const savedEntity = { ...entity, id };
      data.set(id, savedEntity);
      return savedEntity;
    },
    
    async findById(id: string) {
      return data.get(id) || null;
    },
    
    async delete(id: string) {
      return data.delete(id);
    },
    
    simulateError(type: string) {
      shouldError = type;
    },
    
    clear() {
      data.clear();
      shouldError = null;
    }
  };
}

// test-utils/email.ts
export interface TestEmailService {
  sendWelcomeEmail(email: string): Promise<boolean>;
  sendNotification(email: string, message: string): Promise<boolean>;
  getSentEmails(): SentEmail[];
  clear(): void;
}

interface SentEmail {
  to: string;
  type: string;
  message?: string;
  sentAt: Date;
}

export function createTestEmailService(): TestEmailService {
  const sentEmails: SentEmail[] = [];
  
  return {
    async sendWelcomeEmail(email: string) {
      sentEmails.push({
        to: email,
        type: 'welcome',
        sentAt: new Date()
      });
      return true;
    },
    
    async sendNotification(email: string, message: string) {
      sentEmails.push({
        to: email,
        type: 'notification',
        message,
        sentAt: new Date()
      });
      return true;
    },
    
    getSentEmails() {
      return [...sentEmails];
    },
    
    clear() {
      sentEmails.length = 0;
    }
  };
}
```

---

## Factory Function Examples

### Simple Factory Functions

```typescript
// test-utils/factories.ts
export interface TestUser {
  id: string;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
  createdAt: Date;
  permissions: string[];
}

// Basic factory with sensible defaults
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: `user-${Date.now()}`,
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    permissions: ['read'],
    ...overrides
  };
}

// Usage examples
test('user scenarios', () => {
  // Default user
  const defaultUser = createTestUser();
  
  // Admin user
  const adminUser = createTestUser({
    name: 'Admin User',
    permissions: ['read', 'write', 'admin']
  });
  
  // Inactive user
  const inactiveUser = createTestUser({
    isActive: false,
    email: 'inactive@example.com'
  });
});
```

### Advanced Factory Patterns

```typescript
// Sequence-based factories
let userSequence = 0;
export function createTestUserSequence(overrides: Partial<TestUser> = {}): TestUser {
  userSequence++;
  return createTestUser({
    id: `user-${userSequence}`,
    name: `User ${userSequence}`,
    email: `user${userSequence}@example.com`,
    ...overrides
  });
}

// Trait-based factories
export function createAdminUser(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    permissions: ['read', 'write', 'admin', 'delete'],
    name: 'Admin User',
    ...overrides
  });
}

export function createGuestUser(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    permissions: ['read'],
    name: 'Guest User',
    ...overrides
  });
}

// Related entity factories
export function createTestUserWithPosts(
  userOverrides: Partial<TestUser> = {},
  postCount: number = 3
) {
  const user = createTestUser(userOverrides);
  const posts = Array.from({ length: postCount }, (_, i) => 
    createTestPost({
      authorId: user.id,
      title: `Post ${i + 1} by ${user.name}`
    })
  );
  
  return { user, posts };
}

// Complex data factories
export function createTestApiResponse<T>(
  data: T,
  overrides: Partial<ApiResponse<T>> = {}
): ApiResponse<T> {
  return {
    data,
    status: 'success',
    timestamp: new Date().toISOString(),
    requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides
  };
}
```

### Factory Composition

```typescript
// Composing factories for complex scenarios
export function createTestOrganization(overrides: Partial<TestOrganization> = {}) {
  const admin = createAdminUser({ 
    name: 'Organization Admin',
    email: 'admin@organization.com' 
  });
  
  const members = [
    createTestUser({ name: 'Member 1' }),
    createTestUser({ name: 'Member 2' }),
    createGuestUser({ name: 'Guest Member' })
  ];
  
  return {
    id: `org-${Date.now()}`,
    name: 'Test Organization',
    adminId: admin.id,
    memberIds: members.map(m => m.id),
    createdAt: new Date(),
    settings: {
      allowGuestAccess: true,
      requireTwoFactor: false
    },
    ...overrides,
    // Provide easy access to related entities
    admin,
    members
  };
}

// Usage in tests
test('organization permissions', () => {
  const { admin, members, ...org } = createTestOrganization({
    settings: { requireTwoFactor: true }
  });
  
  expect(org.adminId).toBe(admin.id);
  expect(admin.permissions).toContain('admin');
  expect(members).toHaveLength(3);
});
```

---

## Dependency Injection Patterns

### Before: Hard-Coded Dependencies

```typescript
// ❌ Hard-coded dependencies - difficult to test
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class ConfigService {
  private configPath = path.join(process.cwd(), 'config.json');
  
  async loadConfig(): Promise<Config> {
    // Hard to test - depends on file system
    const content = fs.readFileSync(this.configPath, 'utf8');
    return JSON.parse(content);
  }
  
  async saveConfig(config: Config): Promise<void> {
    // Hard to test - writes to real file system
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(this.configPath, content);
  }
  
  generateApiKey(): string {
    // Hard to test - non-deterministic
    return crypto.randomBytes(32).toString('hex');
  }
}
```

### After: Dependency Injection

```typescript
// ✅ Dependency injection - easy to test
export interface FileSystem {
  readFileSync(path: string, encoding: string): string;
  writeFileSync(path: string, content: string): void;
}

export interface CryptoService {
  randomBytes(size: number): Buffer;
}

export interface PathResolver {
  resolveConfigPath(): string;
}

export class ConfigService {
  constructor(
    private fileSystem: FileSystem,
    private crypto: CryptoService,
    private pathResolver: PathResolver
  ) {}
  
  async loadConfig(): Promise<Config> {
    const configPath = this.pathResolver.resolveConfigPath();
    const content = this.fileSystem.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  }
  
  async saveConfig(config: Config): Promise<void> {
    const configPath = this.pathResolver.resolveConfigPath();
    const content = JSON.stringify(config, null, 2);
    this.fileSystem.writeFileSync(configPath, content);
  }
  
  generateApiKey(): string {
    return this.crypto.randomBytes(32).toString('hex');
  }
}

// Production implementations
export class NodeFileSystem implements FileSystem {
  readFileSync(path: string, encoding: string): string {
    return require('fs').readFileSync(path, encoding);
  }
  
  writeFileSync(path: string, content: string): void {
    require('fs').writeFileSync(path, content);
  }
}

export class NodeCryptoService implements CryptoService {
  randomBytes(size: number): Buffer {
    return require('crypto').randomBytes(size);
  }
}

export class DefaultPathResolver implements PathResolver {
  resolveConfigPath(): string {
    return require('path').join(process.cwd(), 'config.json');
  }
}
```

### Test Implementations

```typescript
// test-utils/services.ts
export class TestFileSystem implements FileSystem {
  private files = new Map<string, string>();
  
  readFileSync(path: string, encoding: string): string {
    const content = this.files.get(path);
    if (!content) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }
  
  writeFileSync(path: string, content: string): void {
    this.files.set(path, content);
  }
  
  // Test utilities
  setFile(path: string, content: string): void {
    this.files.set(path, content);
  }
  
  getFile(path: string): string | undefined {
    return this.files.get(path);
  }
  
  hasFile(path: string): boolean {
    return this.files.has(path);
  }
  
  clear(): void {
    this.files.clear();
  }
}

export class TestCryptoService implements CryptoService {
  private sequence = 0;
  
  randomBytes(size: number): Buffer {
    // Deterministic for testing
    this.sequence++;
    const value = `test-key-${this.sequence}`.padEnd(size * 2, '0');
    return Buffer.from(value.slice(0, size * 2), 'hex');
  }
  
  // Test utilities
  reset(): void {
    this.sequence = 0;
  }
}

export class TestPathResolver implements PathResolver {
  constructor(private configPath = '/test/config.json') {}
  
  resolveConfigPath(): string {
    return this.configPath;
  }
  
  // Test utilities
  setConfigPath(path: string): void {
    this.configPath = path;
  }
}

// Factory for creating configured test service
export function createTestConfigService() {
  const fileSystem = new TestFileSystem();
  const crypto = new TestCryptoService();
  const pathResolver = new TestPathResolver();
  
  const service = new ConfigService(fileSystem, crypto, pathResolver);
  
  return {
    service,
    fileSystem,
    crypto,
    pathResolver
  };
}
```

### Testing with Real Implementations

```typescript
// ConfigService.test.ts
describe('ConfigService', () => {
  let testSetup: ReturnType<typeof createTestConfigService>;
  
  beforeEach(() => {
    testSetup = createTestConfigService();
  });
  
  test('loads config from file system', async () => {
    const { service, fileSystem } = testSetup;
    
    // Setup test data
    const testConfig = { apiUrl: 'https://api.test.com', timeout: 5000 };
    fileSystem.setFile('/test/config.json', JSON.stringify(testConfig));
    
    // Test behavior
    const config = await service.loadConfig();
    
    expect(config).toEqual(testConfig);
  });
  
  test('saves config to file system', async () => {
    const { service, fileSystem } = testSetup;
    
    const configToSave = { apiUrl: 'https://new-api.com', timeout: 10000 };
    
    await service.saveConfig(configToSave);
    
    // Verify the actual write occurred
    const savedContent = fileSystem.getFile('/test/config.json');
    expect(JSON.parse(savedContent!)).toEqual(configToSave);
  });
  
  test('generates consistent api keys in test environment', () => {
    const { service, crypto } = testSetup;
    
    const key1 = service.generateApiKey();
    const key2 = service.generateApiKey();
    
    // In test environment, keys are deterministic but different
    expect(key1).toBe('746573742d6b65792d31303030303030303030303030303030303030303030');
    expect(key2).toBe('746573742d6b65792d32303030303030303030303030303030303030303030');
    expect(key1).not.toBe(key2);
    
    // Reset and verify deterministic behavior
    crypto.reset();
    const resetKey = service.generateApiKey();
    expect(resetKey).toBe(key1);
  });
  
  test('handles file system errors gracefully', async () => {
    const { service } = testSetup;
    
    // Don't setup the config file - should throw
    await expect(service.loadConfig()).rejects.toThrow('File not found');
  });
});
```

---

## TypeScript Strictness in Tests

### Enforcing Type Safety

```typescript
// ❌ Avoided by no-any-in-tests rule
test('user creation with any types', () => {
  const userData: any = { name: 'John' }; // Error: no 'any' in tests
  const result = createUser(userData as any); // Error: no 'as any' assertions
  
  // Implicit any through missing annotations
  const mockResponse = { data: { users: [] } }; // Error: implicit any
});

// ✅ Explicit typing enforced
interface CreateUserRequest {
  name: string;
  email: string;
  age?: number;
}

interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
}

test('user creation with explicit types', () => {
  const userData: CreateUserRequest = {
    name: 'John',
    email: 'john@example.com'
  };
  
  const result: CreateUserResponse = createUser(userData);
  
  expect(result).toMatchObject({
    id: expect.any(String),
    name: 'John',
    email: 'john@example.com',
    createdAt: expect.any(Date)
  });
});
```

### Factory Functions with Strict Typing

```typescript
// Strongly typed factory functions
export function createTestApiRequest<T>(
  data: T,
  overrides: Partial<ApiRequest<T>> = {}
): ApiRequest<T> {
  return {
    id: `req-${Date.now()}`,
    timestamp: new Date().toISOString(),
    data,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'test-client/1.0.0'
    },
    ...overrides
  };
}

// Usage with full type safety
test('api request handling', () => {
  interface UserUpdateData {
    name?: string;
    email?: string;
  }
  
  const updateData: UserUpdateData = { name: 'New Name' };
  const request = createTestApiRequest(updateData, {
    headers: { Authorization: 'Bearer test-token' }
  });
  
  // TypeScript ensures type safety throughout
  expect(request.data.name).toBe('New Name');
  expect(request.headers.Authorization).toBe('Bearer test-token');
});
```

### Test Helper Functions with Return Types

```typescript
// ❌ Implicit return types flagged by rule
function setupTestUser() { // Error: missing return type
  return createTestUser({ name: 'Test Setup User' });
}

// ✅ Explicit return types required
function setupTestUser(): TestUser {
  return createTestUser({ name: 'Test Setup User' });
}

function createTestEnvironment(): { 
  user: TestUser; 
  database: TestDatabase; 
  emailService: TestEmailService; 
} {
  const user = createTestUser();
  const database = createTestDatabase();
  const emailService = createTestEmailService();
  
  return { user, database, emailService };
}

// Arrow functions also need explicit types for test helpers
const createTestSession = (): TestSession => {
  return {
    id: `session-${Date.now()}`,
    userId: 'test-user',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour
    isActive: true
  };
};
```

---

## Explicit Import Patterns

### Consistent TypeScript Imports

```typescript
// ❌ Inconsistent import patterns
import { User } from './models/user'; // Missing .ts extension
import { helper } from './utils/helper.js'; // Wrong extension for TS file
import { config } from '../config/app'; // Missing extension

// ✅ Explicit TypeScript imports
import { User } from './models/user.ts';
import { helper } from './utils/helper.ts';
import { config } from '../config/app.ts';
```

### Preventing NPX Usage

```typescript
// ❌ Arbitrary code execution
import { execSync } from 'child_process';

// Dangerous - downloads and runs arbitrary code
execSync('npx some-random-package');
execSync('pnpx create-something my-app');

// In package.json scripts
{
  "scripts": {
    "format": "npx prettier --write .", // Error: use pnpm exec
    "lint": "npx eslint src/" // Error: use pnpm exec
  }
}

// ✅ Explicit dependency management
import { execSync } from 'child_process';

// All tools declared in package.json
execSync('pnpm exec prettier --write .');
execSync('pnpm exec eslint src/');

// In package.json
{
  "devDependencies": {
    "prettier": "^3.0.0",
    "eslint": "^8.50.0"
  },
  "scripts": {
    "format": "pnpm exec prettier --write .",
    "lint": "pnpm exec eslint src/"
  }
}
```

---

## Real-World Migration Examples

### Large Test Suite Migration

```typescript
// Before: Mock-heavy test suite
describe('OrderService Integration', () => {
  let orderService: OrderService;
  let mockPayment: jest.Mocked<PaymentService>;
  let mockInventory: jest.Mocked<InventoryService>;
  let mockEmail: jest.Mocked<EmailService>;
  let mockDb: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    // 50+ lines of mock setup
    mockPayment = createMockPaymentService();
    mockInventory = createMockInventoryService();
    mockEmail = createMockEmailService();
    mockDb = createMockDatabaseService();
    
    orderService = new OrderService(mockPayment, mockInventory, mockEmail, mockDb);
  });

  test('processes order end-to-end', async () => {
    // Brittle mock orchestration
    mockInventory.checkAvailability.mockResolvedValue(true);
    mockInventory.reserveItems.mockResolvedValue({ reservationId: 'res-123' });
    mockPayment.processPayment.mockResolvedValue({ transactionId: 'txn-456' });
    mockDb.saveOrder.mockResolvedValue({ id: 'order-789' });
    mockEmail.sendConfirmation.mockResolvedValue(true);
    
    // Test implementation details, not behavior
    const result = await orderService.processOrder(createOrderRequest());
    
    expect(mockInventory.checkAvailability).toHaveBeenCalledWith(['item-1', 'item-2']);
    expect(mockPayment.processPayment).toHaveBeenCalledWith({
      amount: 100,
      currency: 'USD',
      source: 'card-token'
    });
    // ... many more implementation assertions
  });
});

// After: Real implementation testing
describe('OrderService Integration', () => {
  let testSetup: TestOrderServiceSetup;

  beforeEach(() => {
    testSetup = createTestOrderServiceSetup();
  });

  test('processes order end-to-end', async () => {
    const { orderService, inventory, payment, email, database } = testSetup;
    
    // Setup realistic test data
    const product = createTestProduct({ id: 'item-1', price: 50, stock: 10 });
    const orderRequest = createTestOrderRequest({
      items: [{ productId: 'item-1', quantity: 2 }],
      payment: { method: 'card', token: 'test-card-token' }
    });
    
    inventory.addProduct(product);
    
    // Test actual behavior
    const result = await orderService.processOrder(orderRequest);
    
    // Verify real state changes
    expect(result).toMatchObject({
      id: expect.any(String),
      status: 'confirmed',
      total: 100,
      items: [{ productId: 'item-1', quantity: 2, price: 50 }]
    });
    
    // Verify inventory was actually updated
    const updatedProduct = inventory.getProduct('item-1');
    expect(updatedProduct.stock).toBe(8); // 10 - 2
    
    // Verify payment was processed
    const payments = payment.getProcessedPayments();
    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({
      amount: 100,
      status: 'completed'
    });
    
    // Verify email was sent
    const sentEmails = email.getSentEmails();
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].type).toBe('order-confirmation');
    
    // Verify database state
    const savedOrder = await database.findOrderById(result.id);
    expect(savedOrder).toEqual(result);
  });

  test('handles payment failure gracefully', async () => {
    const { orderService, inventory, payment, email } = testSetup;
    
    // Setup for payment failure
    payment.simulateFailure('INSUFFICIENT_FUNDS');
    
    const orderRequest = createTestOrderRequest();
    
    await expect(orderService.processOrder(orderRequest))
      .rejects.toThrow('Payment failed: INSUFFICIENT_FUNDS');
    
    // Verify no side effects occurred
    expect(inventory.getReservations()).toHaveLength(0);
    expect(email.getSentEmails()).toHaveLength(0);
  });
});

// Supporting test infrastructure
interface TestOrderServiceSetup {
  orderService: OrderService;
  inventory: TestInventoryService;
  payment: TestPaymentService;
  email: TestEmailService;
  database: TestDatabase;
}

function createTestOrderServiceSetup(): TestOrderServiceSetup {
  const inventory = new TestInventoryService();
  const payment = new TestPaymentService();
  const email = new TestEmailService();
  const database = createTestDatabase();
  
  const orderService = new OrderService(inventory, payment, email, database);
  
  return { orderService, inventory, payment, email, database };
}
```

### Configuration Migration

```typescript
// Before: ESLint configuration with mocks allowed
{
  "rules": {
    "jest/prefer-spy-on": "warn", // Allows spies
    "jest/no-mocks-import": "off" // Allows mock imports
  }
}

// After: Explicit decisions configuration
{
  "rules": {
    // Strict no-mocks enforcement
    "@explicit-decisions/no-mocks-or-spies-ts": "error",
    "@explicit-decisions/require-factory-functions-ts": "warn",
    "@explicit-decisions/no-any-in-tests-ts": "error",
    "@explicit-decisions/prefer-real-implementations-ts": "warn",
    
    // Code quality enforcement
    "@explicit-decisions/no-npx-usage-ts": "error",
    "@explicit-decisions/require-ts-extensions-ts": "error",
    "@explicit-decisions/prefer-ts-imports-ts": "warn",
    
    // Disable conflicting rules
    "jest/prefer-spy-on": "off",
    "jest/no-mocks-import": "off"
  }
}
```

This migration transforms testing from brittle mock orchestration to robust behavior verification using real implementations and explicit test data management.
