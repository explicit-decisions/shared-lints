#!/usr/bin/env node

import { program } from '../src/cli.ts';

process.on('unhandledRejection', (error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});

program.parse(process.argv);