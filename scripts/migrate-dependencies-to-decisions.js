#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const rootDir = join(import.meta.dirname, '..');

console.log('🔄 Migrating dependency-versions.json to decisions.toml...\n');

// Read dependency versions
const depVersionsPath = join(rootDir, 'dependency-versions.json');

let depVersions;
try {
  depVersions = JSON.parse(readFileSync(depVersionsPath, 'utf8'));
} catch (error) {
  console.error('❌ Could not read dependency-versions.json');
  process.exit(1);
}

// Migrate each dependency using the CLI
let migrated = 0;
let failed = 0;

for (const [name, info] of Object.entries(depVersions.dependencies)) {
  try {
    // Build the command
    const args = [
      'node', 'tools/decisions/bin/decisions.js',
      'deps', 'add', name,
      '--current', info.currentVersion,
      '--decision', info.decision,
      '--reason', JSON.stringify(info.reason)
    ];
    
    // Add optional fields
    if (info.availableVersion) {
      args.push('--available', info.availableVersion);
    }
    if (info.tier) {
      args.push('--tier', info.tier);
    }
    
    // Map old field names to new metadata fields
    if (info.platformAlternative) {
      args.push('--alt', JSON.stringify(info.platformAlternative));
    }
    if (info.removalTrigger) {
      args.push('--trigger', JSON.stringify(info.removalTrigger));
    }
    if (info.migrationPath) {
      args.push('--migrate', JSON.stringify(info.migrationPath));
    }
    
    // Add default update policy based on tier
    if (info.tier === 'essential') {
      args.push('--update-policy', 'manual');
      args.push('--major', 'block');
    }
    
    // Execute the command
    execSync(args.join(' '), { 
      cwd: rootDir,
      stdio: 'pipe' 
    });
    
    console.log(`✅ Migrated ${name}`);
    migrated++;
  } catch (error) {
    console.error(`❌ Failed to migrate ${name}: ${error.message}`);
    failed++;
  }
}

console.log(`\n✅ Successfully migrated ${migrated} dependencies`);
if (failed > 0) {
  console.log(`❌ Failed to migrate ${failed} dependencies`);
}

console.log('\nNext steps:');
console.log('1. Review the updated decisions.toml');
console.log('2. Update package.json scripts:');
console.log('   - Change "lint:deps" to use: decisions deps check');
console.log('   - Update deps:interactive to use decisions.toml');
console.log('3. Remove dependency-versions.json when ready');
console.log('4. Update CI/CD pipelines to use the new command');