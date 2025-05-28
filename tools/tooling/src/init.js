import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

/**
 * Initialize explicit-decisions framework in current project
 * @param {Object} options - Configuration options
 * @param {string} [options.testing='vitest'] - Testing framework to set up
 */
export async function init(options = {}) {
  const { testing = 'vitest' } = options;
  console.log('🚀 Initializing explicit-decisions framework...\n');
  
  const cwd = process.cwd();
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Check if package.json exists
    const packageJsonPath = join(cwd, 'package.json');
    if (!existsSync(packageJsonPath)) {
      console.error('❌ No package.json found in current directory');
      console.log('💡 Please run this command in a Node.js project root');
      process.exit(1);
    }

    // Read existing package.json
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    console.log('📦 Setting up explicit-decisions framework for:', packageJson.name || 'unnamed project');
    
    // Check package manager and provide pnpm recommendation
    const packageManager = existsSync(join(cwd, 'pnpm-lock.yaml')) ? 'pnpm' : 
                           existsSync(join(cwd, 'yarn.lock')) ? 'yarn' :
                           existsSync(join(cwd, 'package-lock.json')) ? 'npm' : 'unknown';
    
    if (packageManager !== 'pnpm') {
      console.log('💡 Recommendation: Consider using pnpm for better dependency management');
      console.log('   Install: npm install -g pnpm');
      console.log('   Migrate: pnpm import (in this directory)');
    } else {
      console.log('✅ Great choice using pnpm for dependency management!');
    }
    console.log('');

    // Ask what to set up (ESLint is automatic, others are optional)
    const setupDeps = await askQuestion(rl, '📋 Set up dependency management? (y/n): ');
    const setupGitignore = await askQuestion(rl, '📂 Update .gitignore? (y/n): ');
    
    // Determine testing framework (CLI option takes precedence)
    let testingFramework = testing;
    if (!testing || testing === 'vitest') {
      const setupTesting = await askQuestion(rl, '🧪 Set up testing framework? (vitest/jest/none): ');
      testingFramework = setupTesting.toLowerCase().trim() || 'vitest';
    }

    console.log('\n📝 Setting up your project...\n');

    // Set up ESLint configuration (automatic - core part of explicit-decisions)
    console.log('🔧 Setting up ESLint configuration (automatic)...');
    await setupESLintConfig(cwd);

    // Set up testing framework
    if (testingFramework && testingFramework !== 'none') {
      console.log(`🧪 Setting up ${testingFramework} testing framework...`);
      await setupTestingFramework(cwd, testingFramework, packageJson);
    }

    // Set up dependency management
    if (setupDeps.toLowerCase().startsWith('y')) {
      const { deps } = await import('./deps.js');
      await deps('init');
    }

    // Update .gitignore
    if (setupGitignore.toLowerCase().startsWith('y')) {
      await updateGitignore(cwd);
    }

    // Update package.json scripts
    await updatePackageScripts(packageJsonPath, packageJson, setupDeps.toLowerCase().startsWith('y'));

    console.log('🎉 explicit-decisions framework initialized successfully!\n');
    console.log('🎯 Next steps:');
    console.log('  1. Run `pnpm lint` to check your code (ESLint auto-configured!)');
    if (setupDeps.toLowerCase().startsWith('y')) {
      console.log('  2. Run `pnpm deps:interactive` to manage dependencies');
      console.log('  3. Review the generated configuration files');
      console.log('  4. Commit your changes\n');
    } else {
      console.log('  2. Review the generated eslint.config.js');
      console.log('  3. Consider setting up dependency management later with `explicit-decisions deps init`');
      console.log('  4. Commit your changes\n');
    }

  } finally {
    rl.close();
  }
}

/**
 * Ask a question and return the answer
 */
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Set up ESLint configuration with automatic explicit-decisions integration
 */
async function setupESLintConfig(cwd) {
  console.log('🔧 Setting up ESLint configuration with explicit-decisions rules...');

  // Create comprehensive eslint.config.js with explicit-decisions pre-configured
  const eslintConfig = `// @ts-check

import explicitDecisions from '@explicit-decisions/eslint-config';

export default [
  ...explicitDecisions,
  
  // Project-specific overrides
  {
    rules: {
      // Customize explicit-decisions rules as needed
      // '@explicit-decisions/prefer-ts-imports': 'error',
      // '@explicit-decisions/no-mocks-or-spies': 'error',
      // '@explicit-decisions/require-ts-extensions': 'error',
      // '@explicit-decisions/no-npx-usage': 'error',
    }
  },

  // Additional project-specific ignores
  {
    ignores: [
      // Add any project-specific files to ignore
    ],
  }
];`;

  writeFileSync(join(cwd, 'eslint.config.js'), eslintConfig);
  console.log('✅ Created eslint.config.js with explicit-decisions rules pre-configured');

  // Create .eslintignore if it doesn't exist
  const eslintIgnorePath = join(cwd, '.eslintignore');
  if (!existsSync(eslintIgnorePath)) {
    const eslintIgnore = `# Build outputs
node_modules/
dist/
build/
coverage/
*.min.js

# Package manager files
pnpm-lock.yaml
package-lock.json
yarn.lock

# IDE files
.vscode/
.idea/

# Logs
*.log
`;
    writeFileSync(eslintIgnorePath, eslintIgnore);
    console.log('✅ Created comprehensive .eslintignore');
  } else {
    console.log('✅ .eslintignore already exists');
  }
}

/**
 * Update .gitignore
 */
async function updateGitignore(cwd) {
  console.log('📂 Updating .gitignore...');
  
  const gitignorePath = join(cwd, '.gitignore');
  let gitignoreContent = '';
  
  if (existsSync(gitignorePath)) {
    gitignoreContent = readFileSync(gitignorePath, 'utf8');
  }

  // Add explicit-decisions specific ignores
  const explicitDecisionsIgnores = `
# explicit-decisions framework
dependency-versions.json.bak
.ncu-cache/
`;

  if (!gitignoreContent.includes('explicit-decisions framework')) {
    gitignoreContent += explicitDecisionsIgnores;
    writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ Updated .gitignore');
  } else {
    console.log('✅ .gitignore already configured');
  }
}

/**
 * Update package.json scripts
 */
async function updatePackageScripts(packageJsonPath, packageJson, includeDeps) {
  console.log('📝 Updating package.json scripts...');

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  // Add or update lint script (pnpm recommended)
  const packageManager = existsSync(join(cwd, 'pnpm-lock.yaml')) ? 'pnpm' : 
                         existsSync(join(cwd, 'package-lock.json')) ? 'npm' : 'pnpm';
  
  const lintCommand = includeDeps 
    ? 'explicit-decisions deps check && eslint .'
    : 'eslint .';
    
  packageJson.scripts.lint = lintCommand;
  packageJson.scripts['lint:fix'] = 'eslint . --fix';

  if (includeDeps) {
    packageJson.scripts['deps:check'] = 'explicit-decisions deps check';
    packageJson.scripts['deps:interactive'] = 'explicit-decisions deps interactive';
    packageJson.scripts['deps:init'] = 'explicit-decisions deps init';
  }

  // Add helpful comments about pnpm
  if (packageManager !== 'pnpm') {
    console.log('💡 Consider switching to pnpm for better dependency management:');
    console.log('   npm install -g pnpm && pnpm import');
  }

  // Add devDependencies
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }

  packageJson.devDependencies['@explicit-decisions/eslint-config'] = '^1.0.0';
  packageJson.devDependencies['@explicit-decisions/tooling'] = '^1.0.0';
  packageJson.devDependencies['eslint'] = '^9.17.0';

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json');
}

/**
 * Set up testing framework configuration
 */
async function setupTestingFramework(cwd, framework, packageJson) {
  console.log(`🧪 Configuring ${framework} with explicit-decisions testing patterns...`);

  if (framework === 'vitest') {
    await setupVitest(cwd, packageJson);
  } else if (framework === 'jest') {
    await setupJest(cwd, packageJson);
  } else {
    console.log(`⚠️  Unknown testing framework: ${framework}`);
    return;
  }

  // Create test-utils directory structure
  await createTestUtils(cwd);
  
  console.log('✅ Testing framework configured with no-mocks patterns');
}

/**
 * Set up Vitest configuration
 */
async function setupVitest(cwd, packageJson) {
  const vitestConfig = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{js,ts}', 'tests/**/*.test.{js,ts}'],
    exclude: ['node_modules', 'dist', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test-utils/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
});`;

  writeFileSync(join(cwd, 'vitest.config.ts'), vitestConfig);
  console.log('✅ Created vitest.config.ts with strict coverage thresholds');

  // Add test scripts to package.json
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  packageJson.scripts.test = 'vitest';
  packageJson.scripts['test:coverage'] = 'vitest --coverage';
  packageJson.scripts['test:ui'] = 'vitest --ui';

  // Add vitest dependencies
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  packageJson.devDependencies.vitest = '^3.1.4';
  packageJson.devDependencies['@vitest/coverage-v8'] = '^3.1.4';
  packageJson.devDependencies['@vitest/ui'] = '^3.1.4';
}

/**
 * Set up Jest configuration
 */
async function setupJest(cwd, packageJson) {
  const jestConfig = `/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.{js,ts}', '<rootDir>/tests/**/*.test.{js,ts}'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.config.*',
    '!src/test-utils/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\\\.ts$': 'ts-jest',
  },
};`;

  writeFileSync(join(cwd, 'jest.config.js'), jestConfig);
  console.log('✅ Created jest.config.js with strict coverage thresholds');

  // Add test scripts to package.json
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  packageJson.scripts.test = 'jest';
  packageJson.scripts['test:coverage'] = 'jest --coverage';
  packageJson.scripts['test:watch'] = 'jest --watch';

  // Add jest dependencies
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  packageJson.devDependencies.jest = '^29.7.0';
  packageJson.devDependencies['ts-jest'] = '^29.1.1';
  packageJson.devDependencies['@types/jest'] = '^29.5.8';
}

/**
 * Create test utilities directory with no-mocks patterns
 */
async function createTestUtils(cwd) {
  const testUtilsDir = join(cwd, 'src', 'test-utils');
  const { mkdirSync } = await import('fs');
  
  // Create test-utils directory
  mkdirSync(testUtilsDir, { recursive: true });

  // Create factory functions example
  const factoryExample = `/**
 * Factory functions for test data creation
 * Following no-mocks testing philosophy
 */

export interface TestUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * Create test user with default values and optional overrides
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create multiple test users with sequential IDs
 */
export function createTestUsers(count: number, baseOverrides: Partial<TestUser> = {}): TestUser[] {
  return Array.from({ length: count }, (_, index) =>
    createTestUser({
      id: \`test-user-\${index + 1}\`,
      name: \`Test User \${index + 1}\`,
      ...baseOverrides,
    })
  );
}

/**
 * Test implementation for external dependencies
 * Use real implementations instead of mocks
 */
export class TestLogger {
  public logs: string[] = [];

  info(message: string): void {
    this.logs.push(\`INFO: \${message}\`);
  }

  error(message: string): void {
    this.logs.push(\`ERROR: \${message}\`);
  }

  clear(): void {
    this.logs = [];
  }
}`;

  writeFileSync(join(testUtilsDir, 'factories.ts'), factoryExample);

  // Create test setup file
  const setupFile = `/**
 * Test setup following shared-lints testing patterns
 */

// Import custom matchers or setup code here
// Example: import './custom-matchers';

// Global test configuration
beforeEach(() => {
  // Reset any global state
  // Use real implementations, not mocks
});

afterEach(() => {
  // Clean up test data
  // Verify no side effects
});`;

  writeFileSync(join(testUtilsDir, 'setup.ts'), setupFile);

  // Create README with testing guidelines
  const testingReadme = `# Test Utils

This directory contains utilities for testing following the explicit-decisions no-mocks philosophy.

## Principles

1. **No Mocks**: Never use \`jest.fn()\`, \`sinon\`, or similar mocking libraries
2. **Factory Functions**: Use factory functions for test data creation
3. **Real Implementations**: Create real test implementations of external dependencies
4. **Type Safety**: Tests follow the same TypeScript strictness as production code

## Usage

\`\`\`typescript
import { createTestUser, TestLogger } from './test-utils/factories.js';

test('user service creates user correctly', () => {
  const logger = new TestLogger();
  const userService = new UserService(logger);
  
  const userData = createTestUser({ name: 'Custom Name' });
  const result = userService.createUser(userData);
  
  expect(result.id).toBeDefined();
  expect(logger.logs).toContain('INFO: User created');
});
\`\`\`

## Adding New Factories

1. Create factory functions in \`factories.ts\`
2. Use TypeScript interfaces for type safety
3. Provide sensible defaults with override capability
4. Create real implementations for external dependencies
`;

  writeFileSync(join(testUtilsDir, 'README.md'), testingReadme);

  console.log('✅ Created test-utils/ with factory functions and testing guidelines');
}