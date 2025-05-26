#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';

const rootDir = join(import.meta.dirname, '..');

/**
 * Initialize dependency tracking file
 */
function initializeTracking() {
  console.log('📝 Initializing dependency tracking...\n');

  const today = new Date().toISOString().split('T')[0];
  const trackingPath = join(rootDir, 'dependency-versions.json');

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
  console.log('🎯 Next steps:');
  console.log('  1. Run `pnpm lint:deps` to see current outdated dependencies');
  console.log('  2. Run `pnpm deps:interactive` to make decisions about updates');
  console.log('  3. The lint command will now enforce your dependency decisions!\n');
}

initializeTracking();