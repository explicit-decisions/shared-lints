#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

const rootDir = process.env.TEST_ROOT_DIR || join(import.meta.dirname, '..');

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

  // Get all outdated dependencies using ncu
  console.log('🔍 Checking for outdated dependencies...\n');
  
  let allOutdated;
  
  // Check if we're in test mode with mocked data
  if (process.env.MOCK_OUTDATED) {
    allOutdated = JSON.parse(process.env.MOCK_OUTDATED);
  } else {
    let outdatedJson;
    try {
      const ncuOutput = execSync('pnpm exec npm-check-updates --jsonUpgraded', {
        cwd: rootDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      outdatedJson = JSON.parse(ncuOutput || '{}');
    } catch (error) {
      // NCU returns non-zero when no updates available
      outdatedJson = {};
    }

    // Flatten all outdated deps from all workspaces
    allOutdated = {};
    Object.values(outdatedJson).forEach(deps => {
      Object.assign(allOutdated, deps);
    });
  }

  if (Object.keys(allOutdated).length === 0) {
    console.log('✅ All dependencies are up to date!');
    return;
  }

  console.log(`Found ${Object.keys(allOutdated).length} outdated dependencies.\n`);

  // Interactive decision making
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const today = new Date().toISOString().split('T')[0];
  const decisionsToApply = [];
  
  for (const [depName, newVersion] of Object.entries(allOutdated)) {
    const tracked = tracking.dependencies?.[depName] || tracking[depName];
    const currentVersion = tracked?.currentVersion || 'unknown';
    
    // Parse versions to determine update type
    const parseVersion = (v) => {
      const match = v.match(/(\d+)\.(\d+)\.(\d+)/);
      return match ? { major: parseInt(match[1]), minor: parseInt(match[2]), patch: parseInt(match[3]) } : null;
    };
    
    const current = parseVersion(currentVersion);
    const latest = parseVersion(newVersion);
    
    let updateType = 'patch';
    if (current && latest) {
      if (latest.major > current.major) updateType = 'major';
      else if (latest.minor > current.minor) updateType = 'minor';
    }

    console.log(`\n📦 ${depName}`);
    console.log(`   Current: ${currentVersion}`);
    console.log(`   Latest:  ${newVersion}`);
    console.log(`   Type:    ${updateType} update`);
    
    if (tracked) {
      console.log(`   Last reviewed: ${tracked.reviewDate}`);
      if (tracked.reason) console.log(`   Previous reason: ${tracked.reason}`);
    }

    // For patch updates, default to update
    let decision;
    let reason;
    
    if (updateType === 'patch') {
      const answer = await askQuestion(rl, `   Auto-update patch version? [Y/n] `);
      decision = answer.toLowerCase() !== 'n' ? 'update' : 'keep';
      if (decision === 'keep') {
        reason = await askQuestion(rl, `   Reason for keeping old patch version: `);
      } else {
        reason = 'Patch update - backwards compatible';
      }
    } else {
      // For minor/major updates, ask for decision
      const answer = await askQuestion(rl, `   Update? [y/N] `);
      decision = answer.toLowerCase() === 'y' ? 'update' : 'keep';
      
      if (decision === 'update') {
        reason = updateType === 'minor' 
          ? 'Minor update - backwards compatible'
          : await askQuestion(rl, `   Reason for major update: `);
      } else {
        reason = await askQuestion(rl, `   Reason for keeping current version: `);
      }
    }

    // Update tracking
    if (!tracking.dependencies) tracking.dependencies = {};
    tracking.dependencies[depName] = {
      decision,
      currentVersion: decision === 'update' ? newVersion : currentVersion,
      availableVersion: newVersion,
      reason,
      reviewDate: today,
      ...(tracked?.tier && { tier: tracked.tier }),
      ...(tracked?.platformAlternative && { platformAlternative: tracked.platformAlternative }),
      ...(tracked?.removalTrigger && { removalTrigger: tracked.removalTrigger })
    };

    if (decision === 'update') {
      decisionsToApply.push({ name: depName, version: newVersion });
    }
  }

  rl.close();

  // Apply updates
  if (decisionsToApply.length > 0) {
    console.log(`\n📥 Applying ${decisionsToApply.length} updates...\n`);
    
    const packagesToUpdate = decisionsToApply.map(d => `${d.name}@${d.version}`).join(' ');
    
    // In test mode, simulate updates by modifying package.json directly
    if (process.env.MOCK_OUTDATED) {
      const packagePath = join(rootDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      
      decisionsToApply.forEach(({ name, version }) => {
        if (packageJson.dependencies?.[name]) {
          packageJson.dependencies[name] = version;
        } else if (packageJson.devDependencies?.[name]) {
          packageJson.devDependencies[name] = version;
        }
      });
      
      writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('\n✅ Updates applied successfully!');
    } else {
      try {
        execSync(`pnpm update ${packagesToUpdate}`, {
          cwd: rootDir,
          stdio: 'inherit'
        });
        console.log('\n✅ Updates applied successfully!');
      } catch (error) {
        console.error('\n❌ Error applying updates:', error.message);
        console.log('💡 You may need to manually run: pnpm update');
      }
    }
  }

  // Update tracking file
  tracking.lastUpdated = today;
  writeFileSync(trackingPath, JSON.stringify(tracking, null, 2));
  
  console.log('\n✅ Updated dependency-versions.json with your decisions!');
  console.log('🔍 Run `pnpm lint:deps` to verify everything is tracked correctly.');
}

/**
 * Create initial tracking structure
 */
async function createInitialTracking() {
  const today = new Date().toISOString().split('T')[0];
  
  // Read package.json to get current versions
  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const dependencies = {};
  for (const [name, version] of Object.entries(allDeps)) {
    dependencies[name] = {
      decision: 'keep',
      currentVersion: version,
      availableVersion: version,
      reason: 'Initial tracking',
      reviewDate: today
    };
  }

  return {
    $schema: './schemas/dependency-versions.schema.json',
    lastUpdated: today,
    frameworkVersion: '1.0.0',
    metadata: {
      decisionFramework: 'docs/principles/PACKAGE_SELECTION.md',
      reviewSchedule: '30-day cycle for all dependencies',
      maintainer: 'Yehuda'
    },
    dependencies,
    rules: {
      allowedOutdatedDays: 30,
      requireReasonForOld: true,
      blockMajorUpdatesWithoutReview: true,
      tierRequirements: {
        essential: 'Must have platformAlternative documented',
        justified: 'Must have removalTrigger documented',
        deprecated: 'Must have removal timeline'
      },
      reviewCycle: {
        essential: '6 months',
        justified: '30 days',
        deprecated: 'immediate removal'
      }
    }
  };
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