# @explicit-decisions/core

Core engine for the explicit decisions framework. This package provides the underlying functionality for tracking, validating, and managing technical decisions.

## Features

- **Multi-format support**: TOML, YAML, and JSON
- **Validation**: Schema-based validation with custom rules
- **Review tracking**: Automatic review date management
- **Search and filter**: Find decisions by tags, category, or text
- **Extensible**: Plugin architecture for custom categories

## Installation

```bash
npm install @explicit-decisions/core
```

## Usage

```javascript
import { DecisionsManager } from '@explicit-decisions/core';

const manager = new DecisionsManager('./decisions.toml');

// Load decisions
await manager.load();

// Add a decision
await manager.addDecision('dependencies', 'react', {
  version: '^18.0.0',
  reason: 'Latest stable version with concurrent features',
  tags: ['frontend', 'framework']
});

// Get decisions needing review
const needsReview = await manager.getDecisionsNeedingReview();

// Search decisions
const eslintDecisions = await manager.searchDecisions('eslint');
```

## API

### DecisionsManager

Main class for managing decisions.

- `load()` - Load decisions from file
- `save()` - Save decisions to file
- `addDecision(category, key, decision)` - Add new decision
- `updateDecision(category, key, updates)` - Update existing decision
- `getDecisionsNeedingReview()` - Get expired decisions
- `searchDecisions(query)` - Search decisions
- `getDecisionsByTag(tag)` - Filter by tag

### Formats

Support for multiple file formats:

```javascript
import { formats } from '@explicit-decisions/core';

// Parse any format
const decisions = formats.parse(content, 'toml');

// Stringify to any format
const output = formats.stringify(decisions, 'yaml');
```

## License

MIT