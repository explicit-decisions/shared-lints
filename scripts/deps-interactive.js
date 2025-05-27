#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

const rootDir = join(import.meta.dirname, '..');

/**
 * Interactive dependency management with decision tracking
 * Core implementation of "Enforced Explicit Decision" pattern for dependencies
 */
async function interactiveDependencies() {
  console.log('🎯 Interactive Dependency Management\n');
  console.log('This will help you make informed decisions about dependency updates.\n');

  // Check if tracking file exists
  const trackingPath = join(rootDir, 'dependency-versions.json');
  let tracking;
  try {
    tracking = JSON.parse(readFileSync(trackingPath, 'utf8'));
  } catch (error) {
    console.log('📝 Creating initial dependency tracking file...');
    tracking = await createInitialTracking();
    writeFileSync(trackingPath, JSON.stringify(tracking, null, 2));
    console.log('✅ Created dependency-versions.json\n');
  }

  // Run ncu in interactive mode first to get user selections
  console.log('🔍 Running npm-check-updates in interactive mode...\n');
  console.log('⚠️  For any MAJOR version updates, you will need to provide a reason.\n');

  try {
    // Run ncu -i to let user select which packages to update
    execSync('pnpm exec npm-check-updates -i', { 
      cwd: rootDir, 
      stdio: 'inherit'
    });

    console.log('\n🎉 Package.json has been updated with your selections!');
    console.log('📝 Now documenting your decisions in dependency-versions.json...\n');

    // Update tracking file with user decisions
    await updateTrackingFile(tracking, trackingPath);

  } catch (error) {
    if (error.status === 0) {
      console.log('\n✅ No changes were made.');
    } else {
      console.error('❌ Error running interactive mode:', error.message);
      process.exit(1);
    }
  }
}

/**
 * Create initial tracking file
 */
async function createInitialTracking() {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    "$schema": "./schemas/dependency-versions.schema.json",
    "lastUpdated": today,
    "dependencies": {},
    "rules": {
      "allowedOutdatedDays": 30,
      "requireReasonForOld": true,
      "blockMajorUpdatesWithoutReview": true
    }
  };
}

/**
 * Update tracking file with user decisions
 */
async function updateTrackingFile(tracking, trackingPath) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get current state after ncu updates
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
      ncuOutput = JSON.parse(error.stdout);
    } else {
      console.error('❌ Failed to get updated dependency info');
      return;
    }
  }

  // Find dependencies that still have updates available (user chose not to update)
  const outdatedDeps = {};
  [ncuOutput.dependencies, ncuOutput.devDependencies].forEach(deps => {
    if (deps) {
      Object.entries(deps).forEach(([name, info]) => {
        if (info.current !== info.latest) {
          outdatedDeps[name] = info;
        }
      });
    }
  });

  // For each outdated dependency, ask for reason if not already tracked
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  for (const [depName, depInfo] of Object.entries(outdatedDeps)) {
    const tracked = tracking.dependencies[depName];
    const currentMajor = parseInt(depInfo.current.split('.')[0].replace(/\D/g, ''));
    const latestMajor = parseInt(depInfo.latest.split('.')[0].replace(/\D/g, ''));
    const isMajorUpdate = latestMajor > currentMajor;

    if (!tracked || tracked.latestAvailable !== depInfo.latest) {
      console.log(`\n📦 ${depName}: ${depInfo.current} → ${depInfo.latest}`);
      if (isMajorUpdate) {
        console.log(`⚠️  This is a MAJOR version update (${currentMajor} → ${latestMajor})`);
      }

      const reason = await askQuestion(rl, 
        `💭 Why are you keeping ${depName} at v${depInfo.current}? `
      );

      const prefixedReason = isMajorUpdate && !reason.startsWith('REVIEWED:') 
        ? `REVIEWED: ${reason}` 
        : reason;

      tracking.dependencies[depName] = {
        currentVersion: depInfo.current,
        latestAvailable: depInfo.latest,
        reason: prefixedReason,
        reviewDate: today,
        reviewer: "human",
        status: "blocked"
      };
    }
  }

  rl.close();

  // Update tracking file
  tracking.lastUpdated = today;
  writeFileSync(trackingPath, JSON.stringify(tracking, null, 2));
  console.log('\n✅ Updated dependency-versions.json with your decisions!');
  console.log('🔍 Run `pnpm lint:deps` to verify everything is tracked correctly.');
}

/**
 * Ask a question and wait for answer
 */
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Self-executing async function
interactiveDependencies().catch(error => {
  console.error('❌ Error in interactive mode:', error);
  process.exit(1);
});