#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

function showHelp() {
  console.log(`
explicit-decisions v${packageJson.version}
CLI tools for setting up and managing explicit-decisions framework

Usage:
  explicit-decisions <command> [options]

Commands:
  init                 Initialize explicit-decisions in current project
  deps init           Initialize dependency tracking
  deps check          Check dependency decisions
  deps interactive    Interactive dependency management
  help                Show this help message

Examples:
  explicit-decisions init
  explicit-decisions deps init
  explicit-decisions deps interactive

For more help on a specific command:
  explicit-decisions <command> --help
`);
}

const command = process.argv[2];
const subCommand = process.argv[3];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (command === 'init') {
  const { init } = await import('../src/init.js');
  await init();
} else if (command === 'deps') {
  const { deps } = await import('../src/deps.js');
  await deps(subCommand);
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Run "explicit-decisions help" for available commands');
  process.exit(1);
}