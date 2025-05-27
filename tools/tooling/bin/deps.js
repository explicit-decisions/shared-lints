#!/usr/bin/env node

// Direct entry point for dependency management
const { deps } = await import('../src/deps.js');
const subCommand = process.argv[2];
await deps(subCommand);