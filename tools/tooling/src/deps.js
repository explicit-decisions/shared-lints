import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Dependency management commands
 */
export async function deps(subCommand) {
  const cwd = process.cwd();
  
  switch (subCommand) {
    case 'init':
      await initDependencyTracking(cwd);
      break;
    case 'check':
      await checkDependencies(cwd);
      break;
    case 'interactive':
      await interactiveDependencyManagement(cwd);
      break;
    default:
      console.log(`
Dependency Management Commands:

  deps init           Initialize dependency tracking
  deps check          Check dependency decisions  
  deps interactive    Interactive dependency management

Examples:
  shared-lints deps init
  shared-lints deps check
  shared-lints deps interactive
`);
  }
}

/**
 * Initialize dependency tracking file
 */
async function initDependencyTracking(cwd) {
  console.log('📝 Initializing dependency tracking...\n');

  const today = new Date().toISOString().split('T')[0];
  const trackingPath = join(cwd, 'dependency-versions.json');
  const schemaPath = join(cwd, 'schemas', 'dependency-versions.schema.json');

  // Create schemas directory if it doesn't exist
  if (!existsSync(join(cwd, 'schemas'))) {
    const { mkdirSync } = await import('fs');
    mkdirSync(join(cwd, 'schemas'), { recursive: true });
  }

  // Copy schema file
  const schemaContent = await getSchemaContent();
  writeFileSync(schemaPath, schemaContent);

  const initialTracking = {
    "$schema": "./schemas/dependency-versions.schema.json",
    "lastUpdated": today,
    "dependencies": {},
    "rules": {
      "allowedOutdatedDays": 30,
      "requireReasonForOld": true,
      "blockMajorUpdatesWithoutReview": true
    }
  };

  writeFileSync(trackingPath, JSON.stringify(initialTracking, null, 2));
  
  console.log('✅ Created dependency-versions.json');
  console.log('✅ Created schemas/dependency-versions.schema.json');
  console.log('🎯 Next steps:');
  console.log('  1. Add "node_modules/@explicit-decisions/tooling/src/check-dependencies.js" to your lint script');
  console.log('  2. Run `shared-lints deps check` to see current outdated dependencies');
  console.log('  3. Run `shared-lints deps interactive` to make decisions about updates');
  console.log('  4. The lint command will now enforce your dependency decisions!\n');
}

/**
 * Get npm dist-tags for a package
 */
async function getNpmDistTags(packageName) {
  try {
    const output = execSync(`pnpm exec npm view ${packageName} dist-tags --json`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(output);
  } catch (error) {
    console.warn(`⚠️  Could not fetch dist-tags for ${packageName}`);
    return {};
  }
}

/**
 * Check if a tag-based update policy is satisfied
 */
async function checkTagPolicy(packageName, policy, latestVersion) {
  if (policy.type !== 'tag-based' || !policy.targetTag) {
    return false;
  }

  const distTags = await getNpmDistTags(packageName);
  const targetTagVersion = distTags[policy.targetTag];
  
  if (!targetTagVersion) {
    return false;
  }

  // Check if the target tag points to the latest version
  return targetTagVersion === latestVersion;
}

/**
 * Check dependencies against tracking file
 */
async function checkDependencies(cwd) {
  console.log('🔍 Checking dependency versions with npm-check-updates...\n');

  // Read current tracking file
  const trackingPath = join(cwd, 'dependency-versions.json');
  let tracking;
  try {
    tracking = JSON.parse(readFileSync(trackingPath, 'utf8'));
  } catch (error) {
    console.error('❌ Cannot read dependency-versions.json:', error.message);
    console.log('💡 Run `shared-lints deps init` to create initial tracking file');
    process.exit(1);
  }

  // Get outdated dependencies using NCU
  let outdatedOutput;
  try {
    outdatedOutput = execSync('pnpm exec npm-check-updates --jsonUpgraded', { 
      cwd, 
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

    // Check tag-based update policies
    if (tracked.updatePolicy?.type === 'tag-based') {
      const tagReady = await checkTagPolicy(depName, tracked.updatePolicy, newVersion);
      if (tagReady) {
        violations.push({
          type: 'TAG_POLICY_READY',
          dependency: depName,
          targetTag: tracked.updatePolicy.targetTag,
          newVersion: newVersion,
          message: `Tag-based policy satisfied: ${tracked.updatePolicy.targetTag} tag now points to ${newVersion}`
        });
      }
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
      console.log(`   💡 Run 'shared-lints deps interactive' to make decisions about updates\n`);
    } else if (violation.type === 'NEW_VERSION_AVAILABLE') {
      console.log(`   💡 Run 'shared-lints deps interactive' to review the new version\n`);
    } else if (violation.type === 'TAG_POLICY_READY') {
      console.log(`   🎯 Update ready! Run 'shared-lints deps interactive' to upgrade to ${violation.targetTag} tag\n`);
    } else if (violation.type === 'STALE_DECISION') {
      console.log(`   💡 Run 'shared-lints deps interactive' to refresh your decision\n`);
    }
  });

  console.log('🚫 Dependency checking failed. Please address the violations above.');
  process.exit(1);
}

/**
 * Interactive dependency management
 */
async function interactiveDependencyManagement(cwd) {
  const trackingPath = join(cwd, 'dependency-versions.json');
  
  // Read or create tracking file
  let tracking;
  try {
    tracking = JSON.parse(readFileSync(trackingPath, 'utf8'));
  } catch (error) {
    console.log('📝 No tracking file found. Creating initial tracking file...\n');
    await initDependencyTracking(cwd);
    tracking = JSON.parse(readFileSync(trackingPath, 'utf8'));
  }

  console.log('🔍 Running npm-check-updates in interactive mode...\n');
  console.log('⚠️  For any MAJOR version updates, you will need to provide a reason.\n');

  try {
    // Run ncu -i to let user select which packages to update
    execSync('pnpm exec npm-check-updates -i', { 
      cwd, 
      stdio: 'inherit'
    });

    console.log('\n🎉 Package.json has been updated with your selections!');
    console.log('📝 Now documenting your decisions in dependency-versions.json...\n');

    // Update tracking file with user decisions
    await updateTrackingFile(tracking, trackingPath, cwd);

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
 * Update tracking file with user decisions
 */
async function updateTrackingFile(tracking, trackingPath, cwd) {
  // Check if there are still any outdated dependencies to track
  try {
    execSync('pnpm exec npm-check-updates --jsonUpgraded', { 
      cwd, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (error) {
    if (!error.stdout || error.stdout.trim() === '{}') {
      console.log('✅ All dependencies are now up to date!');
      return;
    }
  }

  const today = new Date().toISOString().split('T')[0];
  tracking.lastUpdated = today;

  console.log('✅ Dependency tracking updated!');
  console.log('🎯 All dependency decisions are now documented.\n');

  writeFileSync(trackingPath, JSON.stringify(tracking, null, 2));
}

/**
 * Get the schema content (embedded for portability)
 */
async function getSchemaContent() {
  return JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Dependency Version Tracking",
    "description": "Schema for tracking dependency versions and update decisions",
    "type": "object",
    "required": ["lastUpdated", "dependencies", "rules"],
    "properties": {
      "$schema": {
        "type": "string"
      },
      "lastUpdated": {
        "type": "string",
        "format": "date",
        "description": "Date when this file was last updated"
      },
      "dependencies": {
        "type": "object",
        "description": "Map of dependency names to version tracking info",
        "additionalProperties": {
          "$ref": "#/definitions/DependencyInfo"
        }
      },
      "rules": {
        "$ref": "#/definitions/Rules"
      }
    },
    "definitions": {
      "DependencyInfo": {
        "type": "object",
        "required": ["currentVersion", "latestAvailable", "reason", "reviewDate", "reviewer"],
        "properties": {
          "currentVersion": {
            "type": "string",
            "description": "Version currently used in package.json"
          },
          "latestAvailable": {
            "type": "string",
            "description": "Latest version available on npm"
          },
          "reason": {
            "type": "string",
            "description": "Reason for keeping current version or update decision"
          },
          "reviewDate": {
            "type": "string",
            "format": "date",
            "description": "Date when this decision was last reviewed"
          },
          "reviewer": {
            "type": "string",
            "description": "Who made the decision (user, system, etc.)"
          },
          "updateScheduled": {
            "type": "string",
            "format": "date",
            "description": "When update is scheduled (if status is 'scheduled')"
          },
          "updatePolicy": {
            "type": "object",
            "description": "Policy for when to update this dependency",
            "properties": {
              "type": {
                "type": "string",
                "enum": ["manual", "tag-based", "scheduled"],
                "description": "Type of update policy"
              },
              "targetTag": {
                "type": "string",
                "description": "NPM dist-tag to wait for (e.g., 'stable', 'lts', 'latest')"
              },
              "checkInterval": {
                "type": "string",
                "enum": ["daily", "weekly", "monthly"],
                "description": "How often to check for tag changes"
              }
            },
            "required": ["type"],
            "additionalProperties": false
          },
          "breakingChanges": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Known breaking changes in newer versions"
          }
        }
      },
      "Rules": {
        "type": "object",
        "required": ["allowedOutdatedDays", "requireReasonForOld", "blockMajorUpdatesWithoutReview"],
        "properties": {
          "allowedOutdatedDays": {
            "type": "number",
            "minimum": 0,
            "description": "Number of days a dependency can be outdated before requiring review"
          },
          "requireReasonForOld": {
            "type": "boolean",
            "description": "Whether a reason is required for keeping old versions"
          },
          "blockMajorUpdatesWithoutReview": {
            "type": "boolean",
            "description": "Whether major version updates require explicit review"
          }
        }
      }
    }
  }, null, 2);
}