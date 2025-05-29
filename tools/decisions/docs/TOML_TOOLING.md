# TOML Tooling Support Guide

This guide explains how to get the best development experience when working with `decisions.toml` files.

## Overview

The Explicit Decisions framework provides first-class TOML support with:
- **JSON Schema** for validation and autocomplete
- **VS Code integration** via Even Better TOML extension
- **Formatting** via taplo
- **Automatic setup** during `decisions init`

## Automatic Setup

When you run `decisions init`, the CLI automatically:

1. Creates `.taplo.toml` for consistent formatting
2. Updates VS Code settings for schema association
3. Creates a local schema reference file

```bash
decisions init
# ✓ Created decisions.toml
# ✓ Created .taplo.toml for TOML formatting
# ✓ Updated VS Code settings for autocomplete
# → Install "Even Better TOML" VS Code extension
```

## VS Code Setup

### 1. Install Even Better TOML Extension

```bash
code --install-extension tamasfe.even-better-toml
```

Or search for "Even Better TOML" in the VS Code Extensions marketplace.

### 2. Features You'll Get

- **Autocomplete**: Type-ahead suggestions for all fields
- **Validation**: Real-time error highlighting
- **Hover Documentation**: Field descriptions on hover
- **Formatting**: Auto-format on save
- **Schema-aware**: Knows about valid categories and fields

### 3. Manual Configuration

If automatic setup didn't work, add this to `.vscode/settings.json`:

```json
{
  "evenBetterToml.schema.associations": {
    "decisions.toml": "./node_modules/@explicit-decisions/core/schemas/decisions.schema.json",
    "decisions.*.toml": "./node_modules/@explicit-decisions/core/schemas/decisions.schema.json"
  },
  "[toml]": {
    "editor.defaultFormatter": "tamasfe.even-better-toml",
    "editor.formatOnSave": true
  }
}
```

## Taplo Formatter

[Taplo](https://taplo.tamasfe.dev/) is the standard TOML formatter.

### Installation

```bash
# Install globally
npm install -g @taplo/cli

# Or use via npx
npx @taplo/cli format decisions.toml
```

### Configuration

The `.taplo.toml` file configures formatting rules:

```toml
include = ["decisions.toml", "decisions.*.toml"]

[schema]
path = "./node_modules/@explicit-decisions/core/schemas/decisions.schema.json"
enabled = true

[formatting]
align_entries = false
array_trailing_comma = true
array_auto_expand = true
indent_string = "  "
```

### Format Command

```bash
# Format all TOML files
taplo format

# Check formatting without changing files
taplo format --check
```

## Schema Benefits

The JSON Schema provides:

### 1. Field Validation

```toml
[dependencies]
[dependencies.typescript]
value = "^5.7.0"
reason = "Native .ts imports"
decided = "2024-01-15"
reviewBy = "not-a-date"  # ❌ Error: Invalid date format
```

### 2. Autocomplete

When you type in VS Code:
- Category names (dependencies, architecture, etc.)
- Field names (value, reason, decided, etc.)
- Special fields (tags, alternatives, references)

### 3. Documentation

Hover over any field to see its purpose:
- `value`: The decided value
- `reason`: Why this decision was made
- `reviewBy`: When this decision should be reviewed

## Multiple TOML Files

You can use multiple decision files:

```toml
# decisions.toml - Main decisions
# decisions.dev.toml - Development-specific
# decisions.prod.toml - Production-specific
```

All will get schema support if they match the patterns:
- `decisions.toml`
- `decisions.*.toml`
- `.decisions.toml`

## IntelliJ IDEA Setup

For JetBrains IDEs:

1. Install the TOML plugin (usually pre-installed)
2. Right-click on `decisions.toml`
3. Select "Inject JSON Schema"
4. Browse to `node_modules/@explicit-decisions/core/schemas/decisions.schema.json`

## Troubleshooting

### Schema Not Working

1. Ensure `@explicit-decisions/core` is installed:
   ```bash
   npm install @explicit-decisions/core
   ```

2. Check the schema path exists:
   ```bash
   ls node_modules/@explicit-decisions/core/schemas/
   ```

3. Reload VS Code window:
   - Press `Ctrl/Cmd + Shift + P`
   - Type "Reload Window"

### Formatting Issues

1. Check taplo is installed:
   ```bash
   taplo --version
   ```

2. Validate your TOML syntax:
   ```bash
   taplo lint decisions.toml
   ```

### Even Better TOML Not Working

1. Check extension is enabled:
   - Open Extensions panel
   - Search for "Even Better TOML"
   - Ensure it's enabled

2. Check file associations:
   - Open a `.toml` file
   - Check status bar shows "TOML" as language

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate Decisions

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      
      # Validate schema
      - run: npx decisions check
      
      # Check formatting
      - run: npx @taplo/cli format --check
```

### Pre-commit Hook

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: decisions-check
        name: Validate decisions
        entry: npx decisions check
        language: system
        files: decisions\.toml$
      
      - id: toml-format
        name: Format TOML
        entry: taplo format
        language: system
        files: \.toml$
```

## Best Practices

1. **Commit `.taplo.toml`** - Ensures consistent formatting
2. **Commit `.vscode/settings.json`** - Shares IDE config
3. **Don't commit `decisions.schema.json`** - It's a reference file
4. **Use schema validation in CI** - Catch errors early
5. **Enable format on save** - Keep files clean

## Advanced Schema Usage

### Custom Categories

The schema allows any category name:

```toml
[my-custom-category]
[my-custom-category.my-decision]
value = "custom value"
reason = "why we decided this"
```

### Special Fields

```toml
[architecture.database]
value = "PostgreSQL"
reason = "ACID compliance and JSON support"
decided = "2024-01-15"
reviewBy = "2024-07-15"

# Optional fields with schema support:
tags = ["backend", "data"]
references = ["https://example.com/adr-001"]
impacts = ["API design", "backup strategy"]

# Track alternatives considered
[[architecture.database.alternatives]]
value = "MongoDB"
reason = "No ACID guarantees needed for our use case"

[[architecture.database.alternatives]]
value = "MySQL"
reason = "Less powerful JSON support"

# Link decisions
supersedes = "architecture.old-database"
```

## Resources

- [Even Better TOML Extension](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml)
- [Taplo Documentation](https://taplo.tamasfe.dev/)
- [TOML Specification](https://toml.io/)
- [JSON Schema](https://json-schema.org/)