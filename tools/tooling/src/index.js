/**
 * @explicit-decisions/tooling
 * 
 * CLI tools for setting up and managing shared-lints framework
 * 
 * This package provides:
 * - Project initialization and setup
 * - Dependency management with decision tracking
 * - ESLint configuration bootstrap
 * 
 * Part of the "Enforced Explicit Decision" pattern for LLM-assisted development
 */

export { init } from './init.js';
export { deps } from './deps.js';

// Version info
export const version = '1.0.0';

// Help text
export const help = `
shared-lints tooling v${version}

Commands:
  init                 Initialize shared-lints in current project
  deps init           Initialize dependency tracking
  deps check          Check dependency decisions
  deps interactive    Interactive dependency management

For more information, visit:
https://github.com/explicit-decisions/shared-lints
`;