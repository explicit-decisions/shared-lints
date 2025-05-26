#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';

const scriptDir = dirname(new URL(import.meta.url).pathname);
const rootDir = dirname(scriptDir);

/**
 * LLM Bootstrap Script
 * Provides comprehensive repository orientation for Large Language Models
 * Run with: pnpm llm:bootstrap
 */
function bootstrap() {
  console.log('🤖 LLM Bootstrap - Repository Orientation\n');
  console.log('='.repeat(80));
  
  showProjectOverview();
  showArchitecture();
  showKeyFiles();
  showDevelopmentWorkflow();
  showReferencesAndPatterns();
  showCurrentState();
  showQuickStart();
  showBootstrapMaintenance();
}

function showProjectOverview() {
  console.log('\n📋 PROJECT OVERVIEW');
  console.log('-'.repeat(50));
  
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  
  console.log(`Name: ${pkg.name}`);
  console.log(`Description: ${pkg.description}`);
  console.log(`Version: ${pkg.version}`);
  console.log(`Type: ${pkg.type}`);
  
  console.log('\nPurpose: Framework for LLM-assisted development with explicit decision tracking');
  console.log('Philosophy: Enforce explicit decisions to prevent AI from making poor assumptions');
  console.log('Approach: Combine ESLint rules, dependency management, and reference analysis');
}

function showArchitecture() {
  console.log('\n🏗️  ARCHITECTURE');
  console.log('-'.repeat(50));
  
  console.log('Directory Structure:');
  console.log('├── tools/              # ESLint configs and rules (published packages)');
  console.log('├── scripts/            # Automation and maintenance scripts');
  console.log('├── schemas/            # JSON schema definitions');
  console.log('├── reference-repos/    # Synced examples of patterns in practice');
  console.log('├── docs/              # Documentation and analysis');
  console.log('└── dependency-versions.json # Explicit dependency decisions');
  
  console.log('\nKey Components:');
  console.log('• ESLint Plugin: Custom rules enforcing explicit decisions');
  console.log('• ESLint Config: Shareable configuration presets');
  console.log('• Dependency Management: Interactive NCU with decision tracking');
  console.log('• Reference Analysis: Real-world pattern extraction');
  console.log('• Phase-Based Development: Exploration → Consolidation framework');
}

function showKeyFiles() {
  console.log('\n📄 KEY FILES TO UNDERSTAND');
  console.log('-'.repeat(50));
  
  const keyFiles = [
    {
      path: 'PHILOSOPHY.md',
      purpose: 'Core principles and decision-making framework'
    },
    {
      path: 'dependency-versions.json',
      purpose: 'Tracked dependency decisions with expiration dates'
    },
    {
      path: 'tools/eslint-plugin/src/',
      purpose: 'Custom ESLint rules implementation'
    },
    {
      path: 'reference-repos/README.md',
      purpose: 'How reference repositories work and are maintained'
    },
    {
      path: 'docs/ephemeral/reference-analysis-expansion-plan.md',
      purpose: 'Detailed analysis and expansion roadmap'
    },
    {
      path: 'scripts/check-dependencies.js',
      purpose: 'Dependency validation against decision tracking'
    }
  ];
  
  keyFiles.forEach(file => {
    const exists = existsSync(join(rootDir, file.path));
    const icon = exists ? '✅' : '❌';
    console.log(`${icon} ${file.path}`);
    console.log(`   ${file.purpose}`);
  });
}

function showDevelopmentWorkflow() {
  console.log('\n🔄 DEVELOPMENT WORKFLOW');
  console.log('-'.repeat(50));
  
  console.log('Available Scripts:');
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  
  const scriptCategories = {
    'Build & Test': ['build', 'test', 'typecheck'],
    'Linting': ['lint', 'lint:fix', 'lint:strict', 'lint:deps', 'lint:md'],
    'Dependencies': ['deps:init', 'deps:interactive', 'deps:check'],
    'References': ['refs:sync', 'refs:validate'],
    'Development': ['dev', 'clean'],
    'LLM Tools': ['llm:bootstrap']
  };
  
  Object.entries(scriptCategories).forEach(([category, scripts]) => {
    console.log(`\n${category}:`);
    scripts.forEach(script => {
      if (pkg.scripts[script]) {
        console.log(`  pnpm ${script.padEnd(15)} # ${pkg.scripts[script]}`);
      }
    });
  });
}

function showReferencesAndPatterns() {
  console.log('\n🔍 REFERENCE REPOSITORIES & PATTERNS');
  console.log('-'.repeat(50));
  
  const configPath = join(rootDir, 'reference-repos', 'reference-repos.config.json');
  
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    
    console.log('Configured Reference Repositories:');
    config.repositories.forEach(repo => {
      const syncedPath = join(rootDir, 'reference-repos', repo.name);
      const synced = existsSync(syncedPath);
      const icon = synced ? '✅' : '⚠️ ';
      
      console.log(`${icon} ${repo.name}`);
      console.log(`   Purpose: ${repo.description}`);
      console.log(`   Source: ${repo.path}`);
      if (!synced) {
        console.log(`   💡 Run 'pnpm refs:sync' to update`);
      }
    });
  } else {
    console.log('⚠️  No reference configuration found');
    console.log('💡 Copy reference-repos.config.template.json to reference-repos.config.json');
  }
}

function showCurrentState() {
  console.log('\n📊 CURRENT STATE');
  console.log('-'.repeat(50));
  
  // Check dependency decisions
  const depsPath = join(rootDir, 'dependency-versions.json');
  if (existsSync(depsPath)) {
    const deps = JSON.parse(readFileSync(depsPath, 'utf8'));
    const count = Object.keys(deps.dependencies || {}).length;
    console.log(`✅ Dependency decisions tracked: ${count}`);
  } else {
    console.log('⚠️  No dependency tracking file found');
  }
  
  // Check ESLint rules
  const rulesDir = join(rootDir, 'tools', 'eslint-plugin', 'src');
  if (existsSync(rulesDir)) {
    const rules = readdirSync(rulesDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    console.log(`✅ Custom ESLint rules: ${rules.length}`);
  }
  
  // Check reference repos
  const refsDir = join(rootDir, 'reference-repos');
  if (existsSync(refsDir)) {
    const refs = readdirSync(refsDir).filter(f => {
      const fullPath = join(refsDir, f);
      return statSync(fullPath).isDirectory();
    });
    console.log(`✅ Synced reference repositories: ${refs.length}`);
  }
}

function showQuickStart() {
  console.log('\n🚀 QUICK START FOR LLMs');
  console.log('-'.repeat(50));
  
  console.log('1. Understand the Philosophy:');
  console.log('   📖 Read PHILOSOPHY.md for core principles');
  
  console.log('\n2. Explore Current Patterns:');
  console.log('   📁 Browse reference-repos/ for real-world examples');
  console.log('   🔍 Run: pnpm refs:sync (to update references)');
  
  console.log('\n3. Check Project Health:');
  console.log('   🔍 Run: pnpm lint (comprehensive health check)');
  console.log('   📦 Run: pnpm deps:check (dependency status)');
  
  console.log('\n4. Make Changes Safely:');
  console.log('   ✅ Follow explicit decision patterns');
  console.log('   📋 Update dependency-versions.json for deps');
  console.log('   🧪 Use exploration → consolidation phases');
  
  console.log('\n5. Key Principles to Remember:');
  console.log('   • No "TODO" comments - use tracked decisions');
  console.log('   • Document reasoning for all architectural choices');
  console.log('   • Prefer explicit over implicit configurations');
  console.log('   • Test patterns in reference repositories first');
  
  console.log('\n💡 Pro Tips:');
  console.log('   • Use semantic_search tool to find similar patterns');
  console.log('   • Check reference-repos for implementation examples');
  console.log('   • Validate changes with existing ESLint rules');
  console.log('   • Update documentation alongside code changes');
}

function showBootstrapMaintenance() {
  console.log('\n🔧 MAINTAINING THIS BOOTSTRAP SCRIPT');
  console.log('-'.repeat(50));
  
  console.log('For LLMs updating this script:');
  console.log('');
  console.log('📍 Location: scripts/llm-bootstrap.js');
  console.log('🎯 Purpose: Provide comprehensive repository orientation');
  console.log('');
  console.log('When to Update:');
  console.log('• New major components added to the repository');
  console.log('• Changes to development workflow or scripts');
  console.log('• Updates to project philosophy or architecture');
  console.log('• New reference repositories configured');
  console.log('• Changes to key files or directory structure');
  console.log('');
  console.log('What to Update:');
  console.log('• showArchitecture() - Directory structure changes');
  console.log('• showKeyFiles() - New important files to highlight');
  console.log('• showDevelopmentWorkflow() - New npm scripts or categories');
  console.log('• showQuickStart() - Updated guidance or new principles');
  console.log('• showBootstrapMaintenance() - This meta section itself');
  console.log('');
  console.log('How to Update:');
  console.log('1. 📖 Read current script to understand structure');
  console.log('2. 🔍 Use semantic_search to find related patterns');
  console.log('3. ✏️  Make targeted updates to specific functions');
  console.log('4. 🧪 Test with: pnpm llm:bootstrap');
  console.log('5. ✅ Ensure output is clear and comprehensive');
  console.log('');
  console.log('⚠️  Common Pitfalls:');
  console.log('• Don\'t use Python string multiplication (* operator)');
  console.log('• Use .repeat() method for string repetition');
  console.log('• Keep sections focused and scannable');
  console.log('• Maintain consistent emoji and formatting');
  console.log('• Test thoroughly after changes');
}

// Helper function for string repetition (since '*' operator doesn't work on strings in JS)
function repeat(str, count) {
  return Array(count + 1).join(str);
}

// Run the bootstrap
bootstrap();
