#!/usr/bin/env node

import packageJson from '../package.json' with { type: 'json' };
import { init } from '../src/init.js';
import { deps } from '../src/deps.js';

function showHelp() {
  console.log(`
shared-lints v${packageJson.version}
CLI tools for setting up and managing shared-lints framework

Usage:
  shared-lints <command> [options]

Commands:
  init [options]       Initialize shared-lints in current project
  deps init           Initialize dependency tracking
  deps check          Check dependency decisions
  deps interactive    Interactive dependency management
  help                Show this help message

Init Options:
  --testing <framework>  Set up testing framework (vitest, jest, none)
                        Default: vitest

Examples:
  shared-lints init
  shared-lints init --testing vitest
  shared-lints init --testing jest
  shared-lints deps init
  shared-lints deps interactive

For more help on a specific command:
  shared-lints <command> --help
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
  await init(options);
} else if (command === 'deps') {
  await deps(options.subCommand);
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Run "shared-lints help" for available commands');
  process.exit(1);
}