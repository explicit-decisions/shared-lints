#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const rootDir = join(import.meta.dirname, '..');

/**
 * Enhanced dependency checker using npm-check-updates with decision tracking
 * Part of the "Enforced Explicit Decision" pattern for LLM-assisted development
 */
async function checkDependencies() {
  console.log('🔍 Checking dependency versions with npm-check-updates...\n');

  // Read current tracking file
  const trackingPath = join(rootDir, 'dependency-versions.json');
  let tracking;
  try {
    tracking = JSON.parse(readFileSync(trackingPath, 'utf8'));
  } catch (error) {
    console.error('❌ Cannot read dependency-versions.json:', error.message);
    console.log('💡 Run `pnpm deps:init` to create initial tracking file');
    process.exit(1);
  }

  // Get outdated dependencies using simple ncu command
  let outdatedOutput;
  try {
    outdatedOutput = execSync('pnpm exec ncu --jsonUpgraded', { 
      cwd: rootDir, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (error) {
    // NCU exits with code 0 when there are no updates, but may write to stdout
    if (error.stdout) {
      outdatedOutput = error.stdout;
    } else {
      console.log('✅ All dependencies are up to date!');
      return;
    }
  }

  // Parse the outdated dependencies
  let ncuResult = {};
  if (outdatedOutput.trim()) {
    try {
      ncuResult = JSON.parse(outdatedOutput);
    } catch (parseError) {
      console.log('✅ All dependencies are up to date!');
      return;
    }
  }

  // Flatten workspace results into single outdated dependencies object
  const outdatedDeps = {};
  Object.values(ncuResult).forEach(packageUpdates => {
    Object.assign(outdatedDeps, packageUpdates);
  });

  if (Object.keys(outdatedDeps).length === 0) {
    console.log('✅ All dependencies are up to date!');
    return;
  }

  // Check each outdated dependency against tracking file
  const violations = [];
  const today = new Date().toISOString().split('T')[0];

  for (const [depName, newVersion] of Object.entries(outdatedDeps)) {
    const tracked = tracking.dependencies[depName];
    
    if (!tracked) {
      violations.push({
        type: 'UNTRACKED',
        dependency: depName,
        newVersion: newVersion,
        message: `Dependency ${depName} has updates available but is not tracked in dependency-versions.json`
      });
      continue;
    }

    // Check if latest available has changed
    if (tracked.latestAvailable !== newVersion) {
      violations.push({
        type: 'NEW_VERSION_AVAILABLE',
        dependency: depName,
        trackedLatest: tracked.latestAvailable,
        actualLatest: newVersion,
        message: `New version available: ${tracked.latestAvailable} → ${newVersion} (requires decision update)`
      });
    }

    // Check if decision is stale
    const reviewDate = new Date(tracked.reviewDate);
    const daysSinceReview = Math.floor((new Date() - reviewDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReview > tracking.rules.allowedOutdatedDays) {
      violations.push({
        type: 'STALE_DECISION',
        dependency: depName,
        daysSinceReview,
        allowedDays: tracking.rules.allowedOutdatedDays,
        message: `Dependency ${depName} decision is ${daysSinceReview} days old (max: ${tracking.rules.allowedOutdatedDays})`
      });
    }
  }

  if (violations.length === 0) {
    console.log('✅ All outdated dependencies are properly tracked and up to date!');
    return;
  }

  console.log('❌ Dependency policy violations found:\n');
  
  violations.forEach((violation, index) => {
    console.log(`${index + 1}. ${violation.message}`);
    
    if (violation.type === 'UNTRACKED') {
      console.log(`   💡 Run 'pnpm deps:interactive' to make decisions about updates\n`);
    } else if (violation.type === 'NEW_VERSION_AVAILABLE') {
      console.log(`   💡 Run 'pnpm deps:interactive' to review the new version\n`);
    } else if (violation.type === 'STALE_DECISION') {
      console.log(`   💡 Run 'pnpm deps:interactive' to refresh your decision\n`);
    }
  });

  console.log('🚫 Dependency checking failed. Please address the violations above.');
  process.exit(1);
}

checkDependencies().catch(error => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});