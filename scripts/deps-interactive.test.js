import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('deps-interactive', () => {
  const scriptPath = path.join(__dirname, 'deps-interactive.js');
  const testDir = path.join(__dirname, '../test-fixtures/deps-interactive');
  const testPackageJson = path.join(testDir, 'package.json');
  const testDepsJson = path.join(testDir, 'dependency-versions.json');

  // Helper to spawn the script with test environment
  const spawnScript = (mockOutdated) => {
    return spawn('node', [scriptPath], {
      cwd: testDir,
      env: { 
        ...process.env, 
        MOCK_OUTDATED: JSON.stringify(mockOutdated),
        TEST_ROOT_DIR: testDir
      }
    });
  };

  beforeEach(async () => {
    // Create test directory and files
    await fs.mkdir(testDir, { recursive: true });
    
    // Create test package.json
    await fs.writeFile(testPackageJson, JSON.stringify({
      name: 'test-package',
      version: '1.0.0',
      dependencies: {
        'vitest': '^1.0.0',
        '@types/node': '^20.0.0'
      },
      devDependencies: {
        'eslint': '^8.0.0'
      }
    }, null, 2));

    // Create test dependency-versions.json
    await fs.writeFile(testDepsJson, JSON.stringify({
      '$schema': '../../../schemas/dependency-versions.schema.json',
      'lastUpdated': '2025-01-01',
      'frameworkVersion': '1.0.0',
      'metadata': {
        'decisionFramework': 'docs/principles/PACKAGE_SELECTION.md',
        'reviewSchedule': '30-day cycle for all dependencies',
        'maintainer': 'Test'
      },
      'dependencies': {
        'vitest': {
          decision: 'keep',
          currentVersion: '^1.0.0',
          availableVersion: '^1.0.5',
          reason: 'Test reason',
          reviewDate: '2025-01-01',
          tier: 'essential'
        },
        '@types/node': {
          decision: 'keep',
          currentVersion: '^20.0.0',
          availableVersion: '^22.0.0',
          reason: 'Staying on Node 20',
          reviewDate: '2025-01-01',
          tier: 'essential'
        },
        'eslint': {
          decision: 'keep',
          currentVersion: '^8.0.0',
          availableVersion: '^9.0.0',
          reason: 'Waiting for config updates',
          reviewDate: '2025-01-01',
          tier: 'essential'
        }
      },
      'rules': {}
    }, null, 2));
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should auto-update patch versions by default', async () => {
    // Mock outdated dependencies with patch update
    const mockOutdated = {
      'vitest': {
        current: '1.0.0',
        wanted: '1.0.5',
        latest: '1.0.5',
        dependent: 'test-package',
        location: '/test'
      }
    };

    const child = spawnScript(mockOutdated);

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Simulate pressing Enter (default Y for patch)
    setTimeout(() => {
      child.stdin.write('\n');
      child.stdin.end();
    }, 100);

    await new Promise((resolve) => {
      child.on('close', resolve);
    });

    // Check that dependency-versions.json was updated
    const updatedDeps = JSON.parse(await fs.readFile(testDepsJson, 'utf-8'));
    expect(updatedDeps.dependencies.vitest.decision).toBe('update');
    expect(updatedDeps.dependencies.vitest.currentVersion).toBe('^1.0.5');
    expect(output).toContain('Auto-update patch version? [Y/n]');
  });

  it('should prompt for major updates with default N', async () => {
    const mockOutdated = {
      '@types/node': {
        current: '20.0.0',
        wanted: '20.0.0',
        latest: '22.0.0',
        dependent: 'test-package',
        location: '/test'
      }
    };

    const child = spawnScript(mockOutdated);

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Simulate pressing Enter (default N for major)
    setTimeout(() => {
      child.stdin.write('\n');
      setTimeout(() => {
        child.stdin.write('Keeping LTS version\n');
        child.stdin.end();
      }, 50);
    }, 100);

    await new Promise((resolve) => {
      child.on('close', resolve);
    });

    const updatedDeps = JSON.parse(await fs.readFile(testDepsJson, 'utf-8'));
    expect(updatedDeps.dependencies['@types/node'].decision).toBe('keep');
    expect(updatedDeps.dependencies['@types/node'].currentVersion).toBe('^20.0.0');
    expect(output).toContain('Update? [y/N]');
  });

  it('should update package.json when decision is update', async () => {
    const mockOutdated = {
      'eslint': {
        current: '8.0.0',
        wanted: '8.5.0',
        latest: '8.5.0',
        dependent: 'test-package',
        location: '/test'
      }
    };

    const child = spawnScript(mockOutdated);

    // Simulate choosing to update (minor update)
    setTimeout(() => {
      child.stdin.write('y\n');
      child.stdin.end();
    }, 100);

    await new Promise((resolve) => {
      child.on('close', resolve);
    });

    // Check that package.json was updated
    const updatedPackage = JSON.parse(await fs.readFile(testPackageJson, 'utf-8'));
    expect(updatedPackage.devDependencies.eslint).toBe('^8.5.0');
    
    // Check that dependency-versions.json was synced
    const updatedDeps = JSON.parse(await fs.readFile(testDepsJson, 'utf-8'));
    expect(updatedDeps.dependencies.eslint.currentVersion).toBe('^8.5.0');
    expect(updatedDeps.dependencies.eslint.availableVersion).toBe('^8.5.0');
  });

  it('should handle new dependencies not in dependency-versions.json', async () => {
    // Add a new dependency to package.json
    const pkg = JSON.parse(await fs.readFile(testPackageJson, 'utf-8'));
    pkg.dependencies['new-package'] = '^1.0.0';
    await fs.writeFile(testPackageJson, JSON.stringify(pkg, null, 2));

    const mockOutdated = {
      'new-package': {
        current: '1.0.0',
        wanted: '1.2.0',
        latest: '1.2.0',
        dependent: 'test-package',
        location: '/test'
      }
    };

    const child = spawnScript(mockOutdated);

    // Auto-update minor version
    setTimeout(() => {
      child.stdin.write('y\n');
      child.stdin.end();
    }, 100);

    await new Promise((resolve) => {
      child.on('close', resolve);
    });

    const updatedDeps = JSON.parse(await fs.readFile(testDepsJson, 'utf-8'));
    expect(updatedDeps.dependencies['new-package']).toBeDefined();
    expect(updatedDeps.dependencies['new-package'].decision).toBe('update');
    expect(updatedDeps.dependencies['new-package'].currentVersion).toBe('^1.2.0');
  });

  it('should respect keep decision with reason', async () => {
    const mockOutdated = {
      'vitest': {
        current: '1.0.0',
        wanted: '1.0.5',
        latest: '1.0.5',
        dependent: 'test-package',
        location: '/test'
      }
    };

    const child = spawnScript(mockOutdated);

    // Simulate choosing to keep
    setTimeout(() => {
      child.stdin.write('n\n');
      setTimeout(() => {
        child.stdin.write('Waiting for team decision\n');
        child.stdin.end();
      }, 50);
    }, 100);

    await new Promise((resolve) => {
      child.on('close', resolve);
    });

    const updatedDeps = JSON.parse(await fs.readFile(testDepsJson, 'utf-8'));
    expect(updatedDeps.dependencies.vitest.decision).toBe('keep');
    expect(updatedDeps.dependencies.vitest.currentVersion).toBe('^1.0.0'); // Should not change
    expect(updatedDeps.dependencies.vitest.reason).toBe('Waiting for team decision');
  });
});