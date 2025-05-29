#!/usr/bin/env node

/**
 * Migration script to convert existing decision files to unified format
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { parse, stringify } from '@iarna/toml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🔄 Migrating to unified decisions system...\n');

// Load existing files
const dependencyVersionsPath = join(rootDir, 'dependency-versions.json');
const projectMetadataPath = join(rootDir, 'project-metadata.json');

if (!existsSync(dependencyVersionsPath) || !existsSync(projectMetadataPath)) {
  console.error('❌ Required files not found. Need both:');
  console.error('   - dependency-versions.json');
  console.error('   - project-metadata.json');
  process.exit(1);
}

const dependencyVersions = JSON.parse(readFileSync(dependencyVersionsPath, 'utf8'));
const projectMetadata = JSON.parse(readFileSync(projectMetadataPath, 'utf8'));

// Create unified decisions structure
const decisions = {
  metadata: {
    version: '1.0',
    description: 'Unified explicit decisions for shared-lints framework',
    created: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    schema: './decisions.schema.json'
  },
  
  project: {
    description: 'Project metadata decisions',
    ...convertProjectMetadata(projectMetadata.decisions)
  },
  
  dependencies: {
    description: 'Dependency version decisions with explicit reasoning',
    production: {},
    dev: {}
  },
  
  architecture: {
    description: 'High-level architectural decisions',
    moduleSystem: {
      value: 'ESM',
      reason: 'ES Modules are the future of JavaScript. All packages use type: module',
      decided: '2024-09-01',
      reviewBy: '2025-09-01',
      tags: ['javascript', 'modules']
    },
    typescriptCompilation: {
      value: 'tsc with rewriteRelativeImportExtensions',
      reason: 'TypeScript 5.7+ native solution instead of complex build tools',
      decided: '2024-11-28',
      reviewBy: '2025-05-28',
      tags: ['typescript', 'build']
    },
    testingPhilosophy: {
      value: 'no-mocks',
      reason: 'Real implementations create more reliable tests and better architecture',
      decided: '2024-09-01',
      reviewBy: '2025-09-01',
      tags: ['testing', 'philosophy']
    }
  },
  
  tooling: {
    description: 'Development tooling choices',
    packageManager: {
      value: 'pnpm',
      version: '>=8.0.0',
      reason: 'Superior workspace support and disk efficiency',
      decided: '2024-09-01',
      reviewBy: '2025-09-01',
      tags: ['tooling', 'core']
    },
    nodeVersion: {
      value: '>=18.0.0',
      reason: 'Node.js 18 LTS for native ESM and modern APIs',
      decided: '2024-09-01',
      reviewBy: '2025-09-01',
      tags: ['runtime', 'node']
    }
  }
};

// Convert project metadata
function convertProjectMetadata(metadata) {
  const converted = {};
  
  for (const [key, decision] of Object.entries(metadata)) {
    // Convert camelCase to snake_case for TOML convention
    const tomlKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    converted[tomlKey] = {
      value: decision.value,
      reason: decision.reason,
      decided: decision.decidedAt,
      reviewBy: decision.reviewBy,
      tags: ['metadata', 'naming']
    };
  }
  
  return converted;
}

// Convert dependency decisions
function convertDependencies(deps) {
  for (const [pkg, decision] of Object.entries(deps.dependencies || {})) {
    const category = deps.devDependencies?.includes(pkg) ? 'dev' : 'production';
    
    decisions.dependencies[category][pkg] = {
      version: decision.version,
      reason: decision.reason,
      decided: decision.decidedAt,
      reviewBy: decision.reviewDate,
      tags: decision.tags || [category]
    };
    
    if (decision.updateAvailable) {
      decisions.dependencies[category][pkg].updateAvailable = decision.updateAvailable;
    }
  }
}

convertDependencies(dependencyVersions);

// Write unified decisions file
const outputPath = join(rootDir, 'decisions.toml');
const tomlContent = stringify(decisions);

// Add header comments
const finalContent = `# Explicit Decisions for shared-lints
# This file consolidates all explicit technical decisions for the project
# Generated from migration on ${new Date().toISOString()}

${tomlContent}`;

writeFileSync(outputPath, finalContent, 'utf8');

console.log('✅ Created unified decisions.toml');
console.log('\nNext steps:');
console.log('1. Review the generated decisions.toml file');
console.log('2. Install the new CLI: pnpm add -D @explicit-decisions/cli');
console.log('3. Run "decisions check" to verify');
console.log('4. Remove old decision files once verified');
console.log('\nOld files (keep until verified):');
console.log('  - dependency-versions.json');
console.log('  - project-metadata.json');