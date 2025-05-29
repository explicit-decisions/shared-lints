#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { paths } from './paths.js';

const rootDir = paths.root;

// Load project metadata decisions
const metadataPath = paths.projectMetadata;
if (!existsSync(metadataPath)) {
  console.error('❌ project-metadata.json not found. Run "pnpm metadata:init" to create it.');
  process.exit(1);
}

const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
const decisions = metadata.decisions;

// Find all package.json files recursively
function findPackageFiles(dir, files = []) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    
    // Skip certain directories
    if (entry === 'node_modules' || entry === 'dist' || entry === 'coverage' || 
        entry === '.git' || entry === 'reference-repos' || entry.startsWith('.')) {
      continue;
    }
    
    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory() && !stat.isSymbolicLink()) {
        findPackageFiles(fullPath, files);
      } else if (entry === 'package.json') {
        files.push(fullPath);
      }
    } catch (err) {
      // Skip files/directories we can't access
      console.warn(`Skipping ${fullPath}: ${err.message}`);
    }
  }
  
  return files;
}

const packageFiles = findPackageFiles(rootDir).map(f => f.replace(rootDir + '/', ''));

let hasErrors = false;

// Check each package.json
for (const file of packageFiles) {
  const filePath = join(rootDir, file);
  const pkg = JSON.parse(readFileSync(filePath, 'utf8'));
  const errors = [];

  // Check repository URL
  if (pkg.repository?.url && pkg.repository.url !== decisions.repositoryUrl.value) {
    errors.push(`  ❌ repository.url: "${pkg.repository.url}" should be "${decisions.repositoryUrl.value}"`);
  }

  // Check homepage
  if (pkg.homepage && pkg.homepage !== decisions.homepage.value) {
    errors.push(`  ❌ homepage: "${pkg.homepage}" should be "${decisions.homepage.value}"`);
  }

  // Check bugs URL
  if (pkg.bugs?.url && pkg.bugs.url !== decisions.bugsUrl.value) {
    errors.push(`  ❌ bugs.url: "${pkg.bugs.url}" should be "${decisions.bugsUrl.value}"`);
  }

  // Check package scope (for published packages)
  if (!pkg.private && pkg.name) {
    const expectedPrefix = `${decisions.packageScope.value}/`;
    if (!pkg.name.startsWith(expectedPrefix)) {
      errors.push(`  ❌ name: "${pkg.name}" should start with "${expectedPrefix}"`);
    }
  }

  // Report errors for this file
  if (errors.length > 0) {
    hasErrors = true;
    console.error(`\n${file}:`);
    errors.forEach(error => console.error(error));
  }
}

// Check if metadata decisions need review
const today = new Date();
for (const [key, decision] of Object.entries(decisions)) {
  const reviewDate = new Date(decision.reviewBy);
  if (reviewDate < today) {
    hasErrors = true;
    console.error(`\n❌ Metadata decision "${key}" is past review date (${decision.reviewBy})`);
    console.error(`   Run "pnpm metadata:review" to update decisions`);
  }
}

if (hasErrors) {
  console.error('\n🚫 Project metadata validation failed. Fix the issues above.');
  process.exit(1);
} else {
  console.log('✅ All package.json files match project metadata decisions');
}