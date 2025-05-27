#!/usr/bin/env node

// Direct entry point for project initialization
const { init } = await import('../src/init.js');
await init();