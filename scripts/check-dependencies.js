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

  // Get outdated dependencies from npm-check-updates
  let ncuOutput;
  try {
    const output = execSync('pnpm exec ncu --jsonAll', { 
      cwd: rootDir, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    ncuOutput = JSON.parse(output);
  } catch (error) {
    if (error.stdout) {
      try {
        ncuOutput = JSON.parse(error.stdout);
      } catch {
        console.error('❌ Failed to parse ncu output');
        process.exit(1);
      }
    } else {
      console.error('❌ Failed to run npm-check-updates:', error.message);
      process.exit(1);
    }
  }

  // Extract dependencies that have updates available
  const outdatedDeps = {};
  if (ncuOutput.dependencies) {
    Object.entries(ncuOutput.dependencies).forEach(([name, info]) => {
      if (info.current !== info.latest) {
        outdatedDeps[name] = info;
      }
    });
  }
  if (ncuOutput.devDependencies) {
    Object.entries(ncuOutput.devDependencies).forEach(([name, info]) => {
      if (info.current !== info.latest) {
        outdatedDeps[name] = info;
      }
    });
  }

  if (Object.keys(outdatedDeps).length === 0) {
    console.log('✅ All dependencies are up to date!');
    return;
  }

  // Check each outdated dependency against tracking file
  const violations = [];
  const today = new Date().toISOString().split('T')[0];

  for (const [depName, depInfo] of Object.entries(outdatedDeps)) {
    const tracked = tracking.dependencies[depName];
    
    if (!tracked) {
      violations.push({
        type: 'UNTRACKED',
        dependency: depName,
        current: depInfo.current,
        latest: depInfo.latest,
        message: `Dependency ${depName} is outdated but not tracked in dependency-versions.json`
      });
      continue;
    }

    // Check if the tracked version matches current
    if (tracked.currentVersion !== depInfo.current) {
      violations.push({
        type: 'VERSION_MISMATCH',
        dependency: depName,
        current: depInfo.current,
        tracked: tracked.currentVersion,
        message: `Tracked version (${tracked.currentVersion}) doesn't match package.json (${depInfo.current})`
      });
    }

    // Check if latest available has changed
    if (tracked.latestAvailable !== depInfo.latest) {
      violations.push({
        type: 'NEW_VERSION_AVAILABLE',
        dependency: depName,
        trackedLatest: tracked.latestAvailable,
        actualLatest: depInfo.latest,
        message: `New version available: ${tracked.latestAvailable} → ${depInfo.latest} (requires decision update)`
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

    // Check for major version updates requiring review
    if (tracking.rules.blockMajorUpdatesWithoutReview) {
      const currentMajor = parseInt(depInfo.current.split('.')[0].replace(/\D/g, ''));
      const latestMajor = parseInt(depInfo.latest.split('.')[0].replace(/\D/g, ''));
      
      if (latestMajor > currentMajor && tracked.status !== 'blocked' && !tracked.reason.includes('REVIEWED')) {
        violations.push({
          type: 'MAJOR_UPDATE_NEEDS_REVIEW',
          dependency: depName,
          currentMajor,
          latestMajor,
          message: `Major version update available (${currentMajor} → ${latestMajor}) requires explicit review`
        });
      }
    }
  }

  // Report violations
  if (violations.length > 0) {
    console.log('❌ Dependency version violations found:\n');
    
    violations.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.type}: ${violation.dependency}`);
      console.log(`   ${violation.message}\n`);
    });

    console.log('🔧 To fix these issues:');
    console.log('1. Run `pnpm deps:interactive` to make decisions interactively');
    console.log('2. Or manually update dependency-versions.json with decisions');
    console.log('3. For major updates, add "REVIEWED:" prefix to reason\n');
    
    console.log('💡 Example entry:');
    console.log(JSON.stringify({
      "currentVersion": "^1.6.1",
      "latestAvailable": "^3.1.4", 
      "reason": "REVIEWED: Waiting for ecosystem compatibility with v3",
      "reviewDate": today,
      "reviewer": "human",
      "status": "blocked"
    }, null, 2));

    process.exit(1);
  }

  console.log('✅ All dependency versions are properly tracked and decisions are current!');
}

// Self-executing async function
checkDependencies().catch(error => {
  console.error('❌ Error checking dependencies:', error);
  process.exit(1);
});