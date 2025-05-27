#!/usr/bin/env node

import { deps } from '../src/deps.js';

const subCommand = process.argv[2];
await deps(subCommand);