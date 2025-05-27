#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const scriptDir = dirname(new URL(import.meta.url).pathname);
const rootDir = dirname(scriptDir);
const configPath = join(rootDir, 'reference-repos', 'reference-repos.config.json');

function validateConfig() {
  console.log('🔍 Validating reference-repos.config.json...\n');

  if (!existsSync(configPath)) {
    console.error('❌ Configuration file not found:', configPath);
    console.log('💡 Copy reference-repos.config.template.json to reference-repos.config.json');
    process.exit(1);
  }

  let config;
  try {
    const content = readFileSync(configPath, 'utf8');
    config = JSON.parse(content);
  } catch (error) {
    console.error('❌ Invalid JSON:', error.message);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  if (!config.repositories || !Array.isArray(config.repositories)) {
    errors.push('Missing "repositories" array');
  } else if (config.repositories.length === 0) {
    warnings.push('No repositories configured');
  }

  config.repositories?.forEach((repo, index) => {
    const prefix = `Repository ${index + 1}`;
    
    if (!repo.name) errors.push(`${prefix}: Missing "name"`);
    if (!repo.path) errors.push(`${prefix}: Missing "path"`);
    else if (!existsSync(repo.path)) {
      warnings.push(`${prefix} (${repo.name}): Path not found: ${repo.path}`);
    }
    if (!repo.description) errors.push(`${prefix}: Missing "description"`);
  });

  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach((e, i) => console.log(`${i + 1}. ${e}`));
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach((w, i) => console.log(`${i + 1}. ${w}`));
  }

  if (errors.length === 0) {
    console.log('✅ Configuration is valid!');
    console.log(`📁 Found ${config.repositories.length} repositories`);
  } else {
    process.exit(1);
  }
}

validateConfig();
