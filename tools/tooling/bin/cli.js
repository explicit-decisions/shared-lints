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
  init [options]       Initialize explicit-decisions in current project
  deps init           Initialize dependency tracking
  deps check          Check dependency decisions
  deps interactive    Interactive dependency management
  help                Show this help message

Init Options:
  --testing <framework>  Set up testing framework (vitest, jest, none)
                        Default: vitest

Examples:
  explicit-decisions init
  explicit-decisions init --testing vitest
  explicit-decisions init --testing jest
  explicit-decisions deps init
  explicit-decisions deps interactive

For more help on a specific command:
  explicit-decisions <command> --help
`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = {};
  
  // Parse flags
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const flagName = arg.slice(2);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        options[flagName] = nextArg;
        i++; // Skip the next arg since it's a value
      } else {
        options[flagName] = true;
      }
    } else if (!options.subCommand) {
      options.subCommand = arg;
    }
  }
  
  return { command, options };
}

const { command, options } = parseArgs();

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (command === 'init') {
  const { init } = await import('../src/init.js');
  await init(options);
} else if (command === 'deps') {
  const { deps } = await import('../src/deps.js');
  await deps(options.subCommand);
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Run "explicit-decisions help" for available commands');
  process.exit(1);
}