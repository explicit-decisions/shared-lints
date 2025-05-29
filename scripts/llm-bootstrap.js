#!/usr/bin/env node

/**
 * Simple project health check and orientation
 */

import { existsSync } from 'fs';

console.log('🤖 shared-lints project health check\n');

// Check key files exist
const keyFiles = [
  'package.json',
  'eslint.config.js', 
  'decisions.toml',
  'CLAUDE.md'
];

const missing = keyFiles.filter(file => !existsSync(file));

if (missing.length > 0) {
  console.log('❌ Missing files:', missing.join(', '));
  process.exit(1);
}

console.log('✅ Key files present');
console.log('✅ Run `pnpm lint` to check code quality');
console.log('✅ Run `decisions check` to verify decisions');
console.log('✅ See CLAUDE.md for development guidelines');
console.log('✅ See docs/ for detailed documentation');